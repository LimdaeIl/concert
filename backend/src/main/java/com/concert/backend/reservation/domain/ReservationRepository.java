package com.concert.backend.reservation.domain;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository {

    Reservation save(Reservation reservation);

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
}
