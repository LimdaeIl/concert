package com.concert.backend.reservation.infrastructure.jpa;

import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JpaReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByIdAndMemberId(
            Long id,
            Long memberId
    );

    List<Reservation>
    findAllByMemberIdOrderByCreatedAtDesc(
            Long memberId
    );

    @Query("""
            select count(rs.id)
            from ReservationSeat rs
            join rs.reservation r
            where r.memberId = :memberId
              and r.performanceId = :performanceId
              and r.status in (
                  com.concert.backend.reservation.domain.ReservationStatus.PENDING_PAYMENT,
                  com.concert.backend.reservation.domain.ReservationStatus.COMPLETED
              )
            """)
    long countActiveReservationSeats(
            @Param("memberId") Long memberId,
            @Param("performanceId") Long performanceId
    );

    @Query("""
            select r
            from Reservation r
            where r.status = :status
              and r.expiresAt <= :now
            order by r.expiresAt asc
            """)
    List<Reservation> findExpiredReservations(
            @Param("status") ReservationStatus status,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );


}
