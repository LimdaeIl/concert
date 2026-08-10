package com.concert.backend.reservation.query;

import com.concert.backend.reservation.domain.ReservationStatus;
import java.time.LocalDateTime;

public record AdminReservationQueryRow(
        Long reservationId,
        String reservationNumber,
        ReservationStatus reservationStatus,

        Long memberId,
        String memberEmail,
        String memberName,

        Long concertId,
        String concertTitle,
        String posterUrl,

        Long performanceId,
        LocalDateTime startsAt,
        LocalDateTime endsAt,

        Long venueId,
        String venueName,

        Long venueHallId,
        String venueHallName,

        Integer ticketCount,
        Long totalAmount,

        Long paymentId,
        String paymentNumber,
        String paymentProvider,
        String paymentMethod,
        String paymentStatus,

        LocalDateTime paymentApprovedAt,

        LocalDateTime expiresAt,
        LocalDateTime completedAt,
        LocalDateTime cancelledAt,
        LocalDateTime reservedAt
) {
}
