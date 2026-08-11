package com.concert.backend.concert.cache;

import static org.assertj.core.api.Assertions.assertThat;

import com.concert.backend.concert.application.event.PopularConcertCacheEvictEvent;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.junit.jupiter.api.parallel.ResourceLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Import(
        PopularConcertCacheEvictionIntegrationTest
                .CacheEvictionTestConfig.class
)
@Execution(ExecutionMode.SAME_THREAD)
@ResourceLock("popularConcerts")
class PopularConcertCacheEvictionIntegrationTest {

    private static final String CACHE_NAME =
            "popularConcerts";

    private static final String CACHE_KEY =
            "top10";

    private static final String CACHE_VALUE =
            "cached-popular-concerts";

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private CacheEvictionTransactionService
            transactionService;

    private Cache popularConcertCache;

    @BeforeEach
    void setUp() {

        popularConcertCache =
                cacheManager.getCache(
                        CACHE_NAME
                );

        assertThat(
                popularConcertCache
        )
                .as(
                        "popularConcerts Cache가 등록되어 있어야 합니다."
                )
                .isNotNull();

        /*
         * 테스트 시작 상태를 즉시 비운다.
         */
        popularConcertCache.invalidate();

        System.out.println(
                ">>> INVALIDATE CACHE"
                        + " | thread="
                        + Thread.currentThread().getName()
        );
    }

    @AfterEach
    void tearDown() {

        if (popularConcertCache != null) {
            popularConcertCache.invalidate();
        }
    }

    /*
     * ============================================================
     * COMMIT
     * ============================================================
     */

    @DisplayName(
            "트랜잭션이 커밋되면 인기 공연 캐시는 삭제된다"
    )
    @Test
    void transaction_commit_evicts_popular_concert_cache() {

        /*
         * Given
         */
        putCache();

        assertCacheExists();

        /*
         * When
         *
         * Spring Proxy를 통해
         * 실제 @Transactional Bean 메서드를 호출한다.
         */
        transactionService.publishAndCommit();

        /*
         * Then
         *
         * Transaction COMMIT
         *      ↓
         * AFTER_COMMIT Listener
         *      ↓
         * Redis Cache Clear
         */
        assertCacheDoesNotExist();
    }

    /*
     * ============================================================
     * ROLLBACK
     * ============================================================
     */

    @DisplayName(
            "트랜잭션이 롤백되면 인기 공연 캐시는 유지된다"
    )
    @Test
    void transaction_rollback_keeps_popular_concert_cache() {

        /*
         * Given
         */
        putCache();

        assertCacheExists();

        /*
         * When
         *
         * RuntimeException 발생
         *      ↓
         * Transaction ROLLBACK
         */
        try {

            transactionService
                    .publishAndRollback();

        } catch (TestRollbackException ignored) {
        }

        /*
         * Then
         *
         * AFTER_COMMIT Listener는
         * 실행되면 안 된다.
         */
        assertCacheExists();
    }

    /*
     * ============================================================
     * EVENT 없음
     * ============================================================
     */

    @DisplayName(
            "트랜잭션이 커밋되어도 이벤트가 없으면 인기 공연 캐시는 유지된다"
    )
    @Test
    void transaction_without_event_keeps_popular_concert_cache() {

        /*
         * Given
         */
        putCache();

        assertCacheExists();

        /*
         * When
         */
        transactionService.commitWithoutEvent();

        /*
         * Then
         */
        assertCacheExists();
    }

    /*
     * ============================================================
     * 여러 Event
     * ============================================================
     */

    @DisplayName(
            "같은 트랜잭션에서 여러 이벤트를 발행해도 커밋 후 캐시는 삭제된다"
    )
    @Test
    void multiple_events_evict_popular_concert_cache_after_commit() {

        /*
         * Given
         */
        putCache();

        assertCacheExists();

        /*
         * When
         */
        transactionService
                .publishMultipleAndCommit();

        /*
         * Then
         */
        assertCacheDoesNotExist();
    }

    /*
     * ============================================================
     * Cache Fixture
     * ============================================================
     */

    private void putCache() {

        /*
         * put()은 Transaction-aware Cache 환경에서
         * 실제 저장이 지연될 수 있다.
         *
         * 테스트 Fixture는 즉시 Cache가 존재해야 하므로
         * putIfAbsent()를 사용한다.
         */
        popularConcertCache.putIfAbsent(
                CACHE_KEY,
                CACHE_VALUE
        );

        System.out.println(
                ">>> PUT CACHE"
                        + " | thread="
                        + Thread.currentThread().getName()
                        + " | key="
                        + CACHE_KEY
        );
    }

    /*
     * ============================================================
     * Assertions
     * ============================================================
     */

    private void assertCacheExists() {

        Cache.ValueWrapper valueWrapper =
                popularConcertCache.get(
                        CACHE_KEY
                );

        assertThat(
                valueWrapper
        )
                .as(
                        "popularConcerts Cache가 존재해야 합니다."
                )
                .isNotNull();

        assertThat(
                valueWrapper.get()
        )
                .isEqualTo(
                        CACHE_VALUE
                );
    }

    private void assertCacheDoesNotExist() {

        Cache.ValueWrapper valueWrapper =
                popularConcertCache.get(
                        CACHE_KEY
                );

        assertThat(
                valueWrapper
        )
                .as(
                        "popularConcerts Cache가 삭제되어야 합니다."
                )
                .isNull();
    }

    /*
     * ============================================================
     * Test Configuration
     * ============================================================
     *
     * TransactionTemplate 대신
     * Spring AOP Proxy가 적용된 실제 @Transactional Bean을
     * 테스트 Context에 등록한다.
     *
     * 운영 코드와 같은 방식으로 Transaction이 생성된다.
     */

    @TestConfiguration
    static class CacheEvictionTestConfig {

        @Bean
        CacheEvictionTransactionService
        cacheEvictionTransactionService(
                ApplicationEventPublisher eventPublisher
        ) {
            return new CacheEvictionTransactionService(
                    eventPublisher
            );
        }
    }

    /*
     * ============================================================
     * Test Transaction Service
     * ============================================================
     */

    static class CacheEvictionTransactionService {

        private final ApplicationEventPublisher
                eventPublisher;

        CacheEvictionTransactionService(
                ApplicationEventPublisher eventPublisher
        ) {
            this.eventPublisher =
                    eventPublisher;
        }

        /*
         * 정상 Commit.
         */
        @Transactional
        public void publishAndCommit() {

            eventPublisher.publishEvent(
                    new PopularConcertCacheEvictEvent()
            );
        }

        /*
         * Event 발행 후 RuntimeException.
         *
         * Transaction은 rollback 된다.
         */
        @Transactional
        public void publishAndRollback() {

            eventPublisher.publishEvent(
                    new PopularConcertCacheEvictEvent()
            );

            throw new TestRollbackException();
        }

        /*
         * Transaction은 Commit하지만
         * Event를 발행하지 않는다.
         */
        @Transactional
        public void commitWithoutEvent() {

            /*
             * 의도적으로 아무 작업도 하지 않는다.
             */
        }

        /*
         * 같은 Transaction에서
         * Event를 여러 번 발행한다.
         */
        @Transactional
        public void publishMultipleAndCommit() {

            eventPublisher.publishEvent(
                    new PopularConcertCacheEvictEvent()
            );

            eventPublisher.publishEvent(
                    new PopularConcertCacheEvictEvent()
            );
        }
    }

    /*
     * Rollback 확인용 테스트 예외.
     */
    static class TestRollbackException
            extends RuntimeException {
    }
}
