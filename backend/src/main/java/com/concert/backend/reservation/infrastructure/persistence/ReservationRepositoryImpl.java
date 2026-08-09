package com.concert.backend.reservation.infrastructure.persistence;

import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.domain.ReservationStatus;
import com.concert.backend.reservation.infrastructure.jpa.JpaReservationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class ReservationRepositoryImpl
        implements ReservationRepository {

    private final JpaReservationRepository
            jpaReservationRepository;

    @Override
    public Reservation save(
            Reservation reservation
    ) {
        return jpaReservationRepository.save(
                reservation
        );
    }

    @Override
    public Optional<Reservation> findById(
            Long reservationId
    ) {
        return jpaReservationRepository.findById(
                reservationId
        );
    }

    @Override
    public Optional<Reservation> findByIdAndMemberId(
            Long reservationId,
            Long memberId
    ) {
        return jpaReservationRepository
                .findByIdAndMemberId(
                        reservationId,
                        memberId
                );
    }

    @Override
    public List<Reservation> findAllByMemberId(
            Long memberId
    ) {
        return jpaReservationRepository
                .findAllByMemberIdOrderByCreatedAtDesc(
                        memberId
                );
    }

    @Override
    public long countReservationSeatsByMemberIdAndPerformanceId(
            Long memberId,
            Long performanceId
    ) {
        return jpaReservationRepository
                .countActiveReservationSeats(
                        memberId,
                        performanceId
                );
    }

    @Override
    public List<Reservation> findExpiredPendingReservations(
            LocalDateTime now,
            int limit
    ) {
        return jpaReservationRepository
                .findExpiredReservations(
                        ReservationStatus.PENDING_PAYMENT,
                        now,
                        PageRequest.of(
                                0,
                                limit
                        )
                );
    }

    @Override
    public long countActiveReservationSeats(
            Long memberId,
            Long performanceId
    ) {
        return jpaReservationRepository
                .countActiveReservationSeats(
                        memberId,
                        performanceId
                );
    }

    @Override
    public Optional<Reservation> findActivePendingReservation(
            Long memberId,
            Long performanceId,
            LocalDateTime now
    ) {
        return jpaReservationRepository
                .findActivePendingReservations(
                        memberId,
                        performanceId,
                        now,
                        PageRequest.of(
                                0,
                                1
                        )
                )
                .stream()
                .findFirst();
    }
}
