package com.concert.backend.reservation.concurrency;

import static org.assertj.core.api.Assertions.assertThat;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.reservation.application.CreateReservationService;
import com.concert.backend.reservation.application.command.CreateReservationCommand;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.LongStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "logging.level.org.hibernate.SQL=OFF",
        "logging.level.org.hibernate.orm.jdbc.bind=OFF",
        "logging.level.org.hibernate.engine.jdbc.spi.SqlStatementLogger=OFF",
        "logging.level.org.hibernate.type.descriptor.JdbcBindingLogging=OFF"
})
class ReservationConcurrencyTest {

    /*
     * ============================================================
     * Lock Strategy
     * ============================================================
     *
     * OPTIMISTIC:
     *
     * performanceSeatRepository.findAllById(...)
     *
     * PESSIMISTIC:
     *
     * performanceSeatRepository.findAllByIdForUpdate(...)
     *
     * CreateReservationService 구현과 반드시 동일하게 맞춰야 한다.
     */
    private static final String STRATEGY_NAME = "PESSIMISTIC";

    /*
     * ============================================================
     * Concurrency Levels
     * ============================================================
     *
     * Hikari maximumPoolSize = 10 기준:
     *
     * 10  = Pool × 1
     * 20  = Pool × 2
     * 50  = Pool × 5
     * 100 = Pool × 10
     *
     * 이를 통해 DB Connection Pool saturation 전후의
     * Lock 전략 특성을 비교한다.
     */
    private static final List<Integer> CONCURRENCY_LEVELS = List.of(
            10,
            20,
            50,
            100
    );

    /*
     * 각 concurrency level별 전체 반복 횟수.
     */
    private static final int TOTAL_RUNS = 10;

    /*
     * JVM / Hibernate / MySQL warm-up 영향을 줄이기 위해
     * 각 concurrency level의 최초 2회는 집계에서 제외한다.
     */
    private static final int WARM_UP_RUNS = 2;

    /*
     * 현재 HikariCP maximum-pool-size.
     *
     * Lock 전략 비교 중에는 변경하지 않는다.
     */
    private static final int HIKARI_POOL_SIZE = 10;

    /*
     * 테스트 대상 공연 / 공연 좌석.
     */
    private static final Long PERFORMANCE_ID = 1L;
    private static final Long PERFORMANCE_SEAT_ID = 1L;

    /*
     * ============================================================
     * Synthetic Test Members
     * ============================================================
     *
     * 예약 테이블의 member_id에는 DB FK가 없으므로
     * 좌석 동시성 테스트 전용 ID 영역을 사용한다.
     *
     * 개발 DB의 실제 회원 ID와 충돌하지 않도록
     * 충분히 큰 값부터 시작한다.
     *
     * 예:
     *
     * 100001 ~ 100100
     *
     * CreateReservationService가 MemberRepository를 직접 조회하도록
     * 나중에 변경된다면 이 방식은 실제 테스트 회원 생성 방식으로
     * 변경해야 한다.
     */
    private static final long TEST_MEMBER_ID_START = 100_001L;

    private static final int MAX_CONCURRENT_USERS = CONCURRENCY_LEVELS.stream()
            .mapToInt(Integer::intValue)
            .max()
            .orElseThrow();

    private static final List<Long> TEST_MEMBER_IDS = LongStream.range(
                    TEST_MEMBER_ID_START,
                    TEST_MEMBER_ID_START + MAX_CONCURRENT_USERS
            )
            .boxed()
            .toList();

    @Autowired
    private CreateReservationService createReservationService;

    @Autowired
    private PerformanceSeatRepository performanceSeatRepository;

    @Autowired
    private ReservationConcurrencyTestFixture testFixture;

    @Test
    void 동일한_좌석에_대한_동시_예약을_부하별로_반복_측정한다() throws Exception {

        /*
         * ============================================================
         * Test Configuration Validation
         * ============================================================
         */

        assertThat(TOTAL_RUNS).isGreaterThan(WARM_UP_RUNS);

        assertThat(TEST_MEMBER_IDS).hasSize(MAX_CONCURRENT_USERS);

        printExperimentHeader();

        /*
         * concurrency level별 최종 Summary를 저장한다.
         *
         * LinkedHashMap을 사용해서:
         *
         * 10 → 20 → 50 → 100
         *
         * 출력 순서를 유지한다.
         */
        Map<Integer, ConcurrencySummary> summaries = new LinkedHashMap<>();

        try {

            for (int concurrentUsers : CONCURRENCY_LEVELS) {

                /*
                 * ========================================================
                 * Concurrency Level Experiment
                 * ========================================================
                 */
                ConcurrencySummary summary = runConcurrencyLevel(concurrentUsers);

                summaries.put(
                        concurrentUsers,
                        summary
                );
            }

            /*
             * 모든 concurrency level 결과를 마지막에 한 번에 출력한다.
             */
            printFinalComparison(summaries);

        } finally {

            /*
             * 테스트 성공/실패와 관계없이
             * 마지막 테스트 데이터를 제거한다.
             */
            testFixture.reset(
                    PERFORMANCE_ID,
                    PERFORMANCE_SEAT_ID,
                    TEST_MEMBER_IDS
            );

            printExperimentFooter();
        }
    }

    /*
     * ============================================================
     * 하나의 Concurrency Level 실행
     * ============================================================
     *
     * 예:
     *
     * concurrentUsers = 50
     *
     * 50명 동시 요청을 10번 실행하고
     * 처음 2회는 warm-up으로 제외한 뒤
     * 나머지 8회를 Summary로 만든다.
     */
    private ConcurrencySummary runConcurrencyLevel(
            int concurrentUsers
    ) throws Exception {

        List<Long> memberIds = TEST_MEMBER_IDS.subList(
                0,
                concurrentUsers
        );

        List<ConcurrencyTestResult> measuredResults = new ArrayList<>();

        System.out.println();
        System.out.println();
        System.out.println("############################################################");
        System.out.println("# Concurrency Level");
        System.out.println("############################################################");
        System.out.println("# Strategy         = " + STRATEGY_NAME);
        System.out.println("# Concurrent Users = " + concurrentUsers);
        System.out.println("# Pool Size        = " + HIKARI_POOL_SIZE);
        System.out.println("############################################################");

        for (int run = 1; run <= TOTAL_RUNS; run++) {

            /*
             * ========================================================
             * Arrange
             * ========================================================
             *
             * 매 Run을 동일한 DB 상태에서 시작한다.
             */
            testFixture.reset(
                    PERFORMANCE_ID,
                    PERFORMANCE_SEAT_ID,
                    TEST_MEMBER_IDS
            );

            PerformanceSeat beforeSeat = performanceSeatRepository.findById(
                    PERFORMANCE_SEAT_ID
            ).orElseThrow();

            assertThat(beforeSeat.isAvailable()).isTrue();
            assertThat(beforeSeat.getHeldBy()).isNull();
            assertThat(beforeSeat.getHeldUntil()).isNull();

            /*
             * ========================================================
             * Act
             * ========================================================
             */
            ConcurrencyTestResult result = runConcurrencyTest(
                    concurrentUsers,
                    memberIds
            );

            /*
             * ========================================================
             * Assert
             * ========================================================
             *
             * 동일 좌석에는 무조건 한 요청만 성공해야 한다.
             */
            assertThat(result.successCount()).isEqualTo(1);

            assertThat(result.failureCount()).isEqualTo(
                    concurrentUsers - 1
            );

            assertThat(result.successCount() + result.failureCount()).isEqualTo(
                    concurrentUsers
            );

            assertThat(result.sampleCount()).isEqualTo(
                    concurrentUsers
            );

            /*
             * 모든 실패 요청은 예외 하나로 집계되어야 한다.
             */
            int exceptionCount = result.exceptionDistribution()
                    .values()
                    .stream()
                    .mapToInt(Integer::intValue)
                    .sum();

            assertThat(exceptionCount).isEqualTo(
                    result.failureCount()
            );

            /*
             * winner가 실제 좌석을 HELD 상태로 만들어야 한다.
             */
            PerformanceSeat afterSeat = performanceSeatRepository.findById(
                    PERFORMANCE_SEAT_ID
            ).orElseThrow();

            assertThat(afterSeat.isHeld()).isTrue();

            boolean warmUp = run <= WARM_UP_RUNS;

            printRunResult(
                    run,
                    concurrentUsers,
                    warmUp,
                    result
            );

            if (!warmUp) {
                measuredResults.add(result);
            }
        }

        ConcurrencySummary summary = createSummary(
                concurrentUsers,
                measuredResults
        );

        printSummary(summary);

        return summary;
    }

    /*
     * ============================================================
     * 단일 Run
     * ============================================================
     */
    private ConcurrencyTestResult runConcurrencyTest(
            int concurrentUsers,
            List<Long> memberIds
    ) throws Exception {

        /*
         * 모든 worker가 동일 PerformanceSeat 하나를 예약한다.
         */
        CreateReservationCommand command = new CreateReservationCommand(
                List.of(PERFORMANCE_SEAT_ID)
        );

        /*
         * worker thread 수는 concurrentUsers와 동일하다.
         */
        ExecutorService executorService = Executors.newFixedThreadPool(
                concurrentUsers
        );

        /*
         * 모든 worker가 start line에 도착했는지 확인한다.
         */
        CountDownLatch readyLatch = new CountDownLatch(
                concurrentUsers
        );

        /*
         * 모든 worker를 최대한 같은 시점에 출발시킨다.
         */
        CountDownLatch startLatch = new CountDownLatch(1);

        /*
         * 모든 worker 종료를 기다린다.
         */
        CountDownLatch doneLatch = new CountDownLatch(
                concurrentUsers
        );

        AtomicInteger successCount = new AtomicInteger();

        AtomicInteger failureCount = new AtomicInteger();

        Queue<Long> latencies = new ConcurrentLinkedQueue<>();

        Queue<Throwable> exceptions = new ConcurrentLinkedQueue<>();

        /*
         * 전체 Run wall-clock 측정 시작.
         */
        long experimentStartedAt = System.nanoTime();

        try {

            for (int i = 0; i < concurrentUsers; i++) {

                Long memberId = memberIds.get(i);

                executorService.submit(() -> {

                    readyLatch.countDown();

                    try {

                        /*
                         * 모든 worker가 준비될 때까지 기다린다.
                         */
                        startLatch.await();

                        /*
                         * startLatch 대기시간은 요청 latency에 포함하지 않는다.
                         */
                        long requestStartedAt = System.nanoTime();

                        try {

                            createReservationService.create(
                                    memberId,
                                    PERFORMANCE_ID,
                                    command
                            );

                            successCount.incrementAndGet();

                        } catch (Throwable exception) {

                            failureCount.incrementAndGet();

                            exceptions.add(
                                    exception
                            );

                        } finally {

                            long latencyMillis = (
                                    System.nanoTime() - requestStartedAt
                            ) / 1_000_000;

                            latencies.add(
                                    latencyMillis
                            );
                        }

                    } catch (InterruptedException exception) {

                        Thread.currentThread().interrupt();

                        failureCount.incrementAndGet();

                        exceptions.add(
                                exception
                        );

                    } finally {

                        doneLatch.countDown();
                    }
                });
            }

            /*
             * 모든 worker 준비 완료.
             */
            readyLatch.await();

            /*
             * 동시 출발.
             */
            startLatch.countDown();

            /*
             * 전체 요청 종료 대기.
             */
            doneLatch.await();

        } finally {

            executorService.shutdown();
        }

        long totalElapsedMillis = (
                System.nanoTime() - experimentStartedAt
        ) / 1_000_000;

        List<Long> sortedLatencies = new ArrayList<>(
                latencies
        );

        sortedLatencies.sort(
                Comparator.naturalOrder()
        );

        double averageLatency = calculateAverage(
                sortedLatencies
        );

        long minimumLatency = sortedLatencies.isEmpty()
                ? 0L
                : sortedLatencies.getFirst();

        long maximumLatency = sortedLatencies.isEmpty()
                ? 0L
                : sortedLatencies.getLast();

        long p50 = percentile(
                sortedLatencies,
                50
        );

        long p95 = percentile(
                sortedLatencies,
                95
        );

        long p99 = percentile(
                sortedLatencies,
                99
        );

        Map<String, Integer> exceptionDistribution = createExceptionDistribution(
                exceptions
        );

        return new ConcurrencyTestResult(
                concurrentUsers,
                successCount.get(),
                failureCount.get(),
                totalElapsedMillis,
                averageLatency,
                minimumLatency,
                maximumLatency,
                p50,
                p95,
                p99,
                sortedLatencies.size(),
                exceptionDistribution
        );
    }

    /*
     * ============================================================
     * Summary 생성
     * ============================================================
     */
    private ConcurrencySummary createSummary(
            int concurrentUsers,
            List<ConcurrencyTestResult> results
    ) {

        if (results.isEmpty()) {
            throw new IllegalStateException(
                    "집계할 동시성 테스트 결과가 없습니다."
            );
        }

        List<Long> wallTimes = results.stream()
                .map(ConcurrencyTestResult::totalElapsedMillis)
                .sorted()
                .toList();

        List<Double> averageLatencies = results.stream()
                .map(ConcurrencyTestResult::averageLatency)
                .sorted()
                .toList();

        List<Long> p50Latencies = results.stream()
                .map(ConcurrencyTestResult::p50)
                .sorted()
                .toList();

        List<Long> p95Latencies = results.stream()
                .map(ConcurrencyTestResult::p95)
                .sorted()
                .toList();

        List<Long> p99Latencies = results.stream()
                .map(ConcurrencyTestResult::p99)
                .sorted()
                .toList();

        int totalSuccessCount = results.stream()
                .mapToInt(ConcurrencyTestResult::successCount)
                .sum();

        int totalFailureCount = results.stream()
                .mapToInt(ConcurrencyTestResult::failureCount)
                .sum();

        Map<String, Integer> exceptionDistribution = new HashMap<>();

        for (ConcurrencyTestResult result : results) {

            result.exceptionDistribution().forEach(
                    (exceptionName, count) ->
                            exceptionDistribution.merge(
                                    exceptionName,
                                    count,
                                    Integer::sum
                            )
            );
        }

        int totalExceptionCount = exceptionDistribution.values()
                .stream()
                .mapToInt(Integer::intValue)
                .sum();

        /*
         * Summary 정합성 검증.
         */
        assertThat(totalSuccessCount).isEqualTo(
                results.size()
        );

        assertThat(totalFailureCount).isEqualTo(
                results.size() * (concurrentUsers - 1)
        );

        assertThat(totalExceptionCount).isEqualTo(
                totalFailureCount
        );

        return new ConcurrencySummary(
                concurrentUsers,
                results.size(),
                totalSuccessCount,
                totalFailureCount,
                averageLong(wallTimes),
                medianLong(wallTimes),
                averageDouble(averageLatencies),
                medianDouble(averageLatencies),
                medianLong(p50Latencies),
                medianLong(p95Latencies),
                medianLong(p99Latencies),
                exceptionDistribution
        );
    }

    private double calculateAverage(
            List<Long> latencies
    ) {

        return latencies.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
    }

    /*
     * Nearest Rank percentile.
     */
    private long percentile(
            List<Long> sortedLatencies,
            int percentile
    ) {

        if (sortedLatencies.isEmpty()) {
            return 0L;
        }

        int rank = (int) Math.ceil(
                sortedLatencies.size()
                        * percentile
                        / 100.0
        );

        int index = Math.max(
                0,
                Math.min(
                        rank - 1,
                        sortedLatencies.size() - 1
                )
        );

        return sortedLatencies.get(
                index
        );
    }

    private Map<String, Integer> createExceptionDistribution(
            Queue<Throwable> exceptions
    ) {

        Map<String, Integer> distribution = new HashMap<>();

        for (Throwable exception : exceptions) {

            String exceptionName = exception
                    .getClass()
                    .getSimpleName();

            distribution.merge(
                    exceptionName,
                    1,
                    Integer::sum
            );
        }

        return distribution;
    }

    /*
     * ============================================================
     * Run 출력
     * ============================================================
     */
    private void printRunResult(
            int run,
            int concurrentUsers,
            boolean warmUp,
            ConcurrencyTestResult result
    ) {

        System.out.println();
        System.out.println("============================================================");
        System.out.println(" Reservation Concurrency Run");
        System.out.println("============================================================");
        System.out.println("전략               = " + STRATEGY_NAME);
        System.out.println("동시 요청          = " + concurrentUsers);
        System.out.println("실행               = " + run + " / " + TOTAL_RUNS + (warmUp ? " [WARM-UP]" : ""));
        System.out.println("성공               = " + result.successCount());
        System.out.println("실패               = " + result.failureCount());
        System.out.println("Wall Time          = " + result.totalElapsedMillis() + " ms");
        System.out.printf("평균 latency       = %.2f ms%n", result.averageLatency());
        System.out.println("p50                = " + result.p50() + " ms");
        System.out.println("p95                = " + result.p95() + " ms");
        System.out.println("p99                = " + result.p99() + " ms");
        System.out.println("예외               = " + result.exceptionDistribution());
        System.out.println("============================================================");
    }

    /*
     * ============================================================
     * Level Summary 출력
     * ============================================================
     */
    private void printSummary(
            ConcurrencySummary summary
    ) {

        System.out.println();
        System.out.println("############################################################");
        System.out.println("# Reservation Concurrency Summary");
        System.out.println("############################################################");

        System.out.println(
                "RESULT"
                        + " | strategy=" + STRATEGY_NAME
                        + " | concurrent=" + summary.concurrentUsers()
                        + " | pool=" + HIKARI_POOL_SIZE
                        + " | runs=" + summary.measuredRuns()
                        + " | success=" + summary.totalSuccessCount()
                        + " | failure=" + summary.totalFailureCount()
                        + " | avgWall=" + format(summary.averageWallTime()) + "ms"
                        + " | medianWall=" + format(summary.medianWallTime()) + "ms"
                        + " | avgLatency=" + format(summary.averageRequestLatency()) + "ms"
                        + " | medianLatency=" + format(summary.medianRequestLatency()) + "ms"
                        + " | p50=" + format(summary.medianP50()) + "ms"
                        + " | p95=" + format(summary.medianP95()) + "ms"
                        + " | p99=" + format(summary.medianP99()) + "ms"
                        + " | exceptions=" + summary.exceptionDistribution()
        );

        System.out.println("############################################################");
    }

    /*
     * ============================================================
     * 최종 비교 출력
     * ============================================================
     *
     * 한 전략에 대한 10 / 20 / 50 / 100 결과를
     * 한 번에 확인할 수 있도록 만든다.
     */
    private void printFinalComparison(
            Map<Integer, ConcurrencySummary> summaries
    ) {

        System.out.println();
        System.out.println();
        System.out.println("================================================================================================================");
        System.out.println(" Reservation Concurrency Final Result");
        System.out.println("================================================================================================================");
        System.out.println("Strategy = " + STRATEGY_NAME);
        System.out.println("Hikari   = " + HIKARI_POOL_SIZE);
        System.out.println("----------------------------------------------------------------------------------------------------------------");
        System.out.printf(
                "%-12s %-12s %-12s %-14s %-14s %-10s %-10s %-10s%n",
                "Concurrent",
                "MedianWall",
                "AvgLatency",
                "MedianLatency",
                "P50",
                "P95",
                "P99",
                "Failures"
        );
        System.out.println("----------------------------------------------------------------------------------------------------------------");

        summaries.values().forEach(
                summary -> System.out.printf(
                        "%-12d %-12s %-12s %-14s %-14s %-10s %-10s %-10d%n",
                        summary.concurrentUsers(),
                        format(summary.medianWallTime()),
                        format(summary.averageRequestLatency()),
                        format(summary.medianRequestLatency()),
                        format(summary.medianP50()),
                        format(summary.medianP95()),
                        format(summary.medianP99()),
                        summary.totalFailureCount()
                )
        );

        System.out.println("================================================================================================================");
    }

    private double averageLong(
            List<Long> values
    ) {

        return values.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
    }

    private double averageDouble(
            List<Double> values
    ) {

        return values.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    private double medianLong(
            List<Long> sortedValues
    ) {

        if (sortedValues.isEmpty()) {
            return 0.0;
        }

        int size = sortedValues.size();
        int middle = size / 2;

        if (size % 2 == 1) {
            return sortedValues.get(middle);
        }

        return (
                sortedValues.get(middle - 1)
                        + sortedValues.get(middle)
        ) / 2.0;
    }

    private double medianDouble(
            List<Double> sortedValues
    ) {

        if (sortedValues.isEmpty()) {
            return 0.0;
        }

        int size = sortedValues.size();
        int middle = size / 2;

        if (size % 2 == 1) {
            return sortedValues.get(middle);
        }

        return (
                sortedValues.get(middle - 1)
                        + sortedValues.get(middle)
        ) / 2.0;
    }

    private String format(
            double value
    ) {

        return String.format(
                "%.2f",
                value
        );
    }

    private void printExperimentHeader() {

        System.out.println();
        System.out.println();
        System.out.println("############################################################");
        System.out.println("# Reservation Concurrency Experiment");
        System.out.println("############################################################");
        System.out.println("# Strategy               = " + STRATEGY_NAME);
        System.out.println("# Concurrency Levels     = " + CONCURRENCY_LEVELS);
        System.out.println("# Hikari maximumPoolSize = " + HIKARI_POOL_SIZE);
        System.out.println("# Runs / Level           = " + TOTAL_RUNS);
        System.out.println("# Warm-up Runs / Level   = " + WARM_UP_RUNS);
        System.out.println("############################################################");
    }

    private void printExperimentFooter() {

        System.out.println();
        System.out.println("############################################################");
        System.out.println("# Experiment Finished");
        System.out.println("############################################################");
    }

    private record ConcurrencyTestResult(
            int concurrentUsers,
            int successCount,
            int failureCount,
            long totalElapsedMillis,
            double averageLatency,
            long minimumLatency,
            long maximumLatency,
            long p50,
            long p95,
            long p99,
            int sampleCount,
            Map<String, Integer> exceptionDistribution
    ) {
    }

    private record ConcurrencySummary(
            int concurrentUsers,
            int measuredRuns,
            int totalSuccessCount,
            int totalFailureCount,
            double averageWallTime,
            double medianWallTime,
            double averageRequestLatency,
            double medianRequestLatency,
            double medianP50,
            double medianP95,
            double medianP99,
            Map<String, Integer> exceptionDistribution
    ) {
    }
}
