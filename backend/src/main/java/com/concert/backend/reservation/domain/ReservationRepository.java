package com.concert.backend.reservation.domain;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository {

    Reservation save(
            Reservation reservation
    );

    Optional<Reservation> findById(
            Long reservationId
    );

    Optional<Reservation> findByIdAndMemberId(
            Long reservationId,
            Long memberId
    );

    List<Reservation> findAllByMemberId(
            Long memberId
    );

    long countReservationSeatsByMemberIdAndPerformanceId(
            Long memberId,
            Long performanceId
    );

    List<Reservation> findExpiredPendingReservations(
            LocalDateTime now,
            int limit
    );

    long countActiveReservationSeats(
            Long memberId,
            Long performanceId
    );

    /*
     * 같은 회원 + 같은 공연 회차에서
     * 아직 만료되지 않은 PENDING_PAYMENT 예약 조회.
     *
     * 결제 대기 안내 및 중복 예약 방지에 사용한다.
     */
    Optional<Reservation> findActivePendingReservation(
            Long memberId,
            Long performanceId,
            LocalDateTime now
    );
}
