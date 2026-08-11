package com.concert.backend.reservation.concurrency;

import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Component
public class ReservationConcurrencyTestFixture {

    private final JdbcTemplate jdbcTemplate;

    /*
     * ============================================================
     * 테스트 상태 초기화
     * ============================================================
     *
     * 목적:
     *
     * 각 동시성 실험이 완전히 동일한 DB 상태에서 시작하도록 한다.
     *
     * 정리 대상:
     *
     * 1. 테스트 회원이 생성한 PENDING_PAYMENT 예약
     * 2. 해당 예약의 결제 데이터
     * 3. 해당 예약의 ReservationSeat
     * 4. Reservation
     * 5. PerformanceSeat → AVAILABLE 복구
     *
     * 기존 EXPIRED / COMPLETED / CANCELLED 예약 이력은 삭제하지 않는다.
     */
    @Transactional
    public void reset(
            Long performanceId,
            Long performanceSeatId,
            List<Long> memberIds
    ) {

        if (memberIds == null || memberIds.isEmpty()) {
            throw new IllegalArgumentException("테스트 회원 ID가 필요합니다.");
        }

        List<Long> reservationIds = findPendingReservationIds(
                performanceId,
                performanceSeatId,
                memberIds
        );

        if (!reservationIds.isEmpty()) {
            deletePayments(reservationIds);
            deleteReservationSeats(reservationIds);
            deleteReservations(reservationIds);
        }

        resetPerformanceSeat(performanceSeatId);
    }

    /*
     * 테스트 대상 좌석을 사용하는 PENDING_PAYMENT 예약만 조회한다.
     */
    private List<Long> findPendingReservationIds(
            Long performanceId,
            Long performanceSeatId,
            List<Long> memberIds
    ) {

        String placeholders = createPlaceholders(memberIds.size());

        String sql = """
                SELECT DISTINCT r.id
                FROM v1_reservations r
                INNER JOIN v1_reservation_seats rs
                    ON rs.reservation_id = r.id
                WHERE r.performance_id = ?
                  AND rs.performance_seat_id = ?
                  AND r.status = 'PENDING_PAYMENT'
                  AND r.member_id IN (%s)
                """.formatted(placeholders);

        Object[] parameters = new Object[2 + memberIds.size()];

        parameters[0] = performanceId;
        parameters[1] = performanceSeatId;

        for (int i = 0; i < memberIds.size(); i++) {
            parameters[i + 2] = memberIds.get(i);
        }

        return jdbcTemplate.queryForList(
                sql,
                Long.class,
                parameters
        );
    }

    /*
     * 논리적으로 Reservation과 연결된 Payment를 먼저 정리한다.
     */
    private void deletePayments(
            List<Long> reservationIds
    ) {

        String placeholders = createPlaceholders(reservationIds.size());

        String sql = """
                DELETE FROM v1_payments
                WHERE reservation_id IN (%s)
                """.formatted(placeholders);

        jdbcTemplate.update(
                sql,
                reservationIds.toArray()
        );
    }

    /*
     * ReservationSeat은 Reservation FK를 가지고 있으므로
     * 부모 Reservation보다 먼저 삭제해야 한다.
     */
    private void deleteReservationSeats(
            List<Long> reservationIds
    ) {

        String placeholders = createPlaceholders(reservationIds.size());

        String sql = """
                DELETE FROM v1_reservation_seats
                WHERE reservation_id IN (%s)
                """.formatted(placeholders);

        jdbcTemplate.update(
                sql,
                reservationIds.toArray()
        );
    }

    private void deleteReservations(
            List<Long> reservationIds
    ) {

        String placeholders = createPlaceholders(reservationIds.size());

        String sql = """
                DELETE FROM v1_reservations
                WHERE id IN (%s)
                """.formatted(placeholders);

        jdbcTemplate.update(
                sql,
                reservationIds.toArray()
        );
    }

    /*
     * PerformanceSeat을 다음 실험이 시작할 수 있도록 복원한다.
     *
     * @Version 값은 의도적으로 변경하지 않는다.
     *
     * version 값을 0으로 되돌리는 것은 실제 애플리케이션 동작과 다르고,
     * Optimistic Lock 검증에도 필요하지 않다.
     */
    private void resetPerformanceSeat(
            Long performanceSeatId
    ) {

        jdbcTemplate.update(
                """
                UPDATE v1_performance_seats
                SET
                    status = 'AVAILABLE',
                    held_by = NULL,
                    held_until = NULL
                WHERE id = ?
                """,
                performanceSeatId
        );
    }

    private String createPlaceholders(
            int size
    ) {

        return String.join(
                ",",
                Collections.nCopies(
                        size,
                        "?"
                )
        );
    }
}
