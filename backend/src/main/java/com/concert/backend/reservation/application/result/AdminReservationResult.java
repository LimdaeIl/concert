package com.concert.backend.reservation.application.result;

import com.concert.backend.reservation.domain.ReservationStatus;
import com.concert.backend.reservation.query.AdminReservationQueryRow;
import java.time.LocalDateTime;

public record AdminReservationResult(
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

    public static AdminReservationResult from(
            AdminReservationQueryRow row
    ) {
        return new AdminReservationResult(
                row.reservationId(),
                row.reservationNumber(),
                row.reservationStatus(),

                row.memberId(),
                row.memberEmail(),
                row.memberName(),

                row.concertId(),
                row.concertTitle(),
                row.posterUrl(),

                row.performanceId(),
                row.startsAt(),
                row.endsAt(),

                row.venueId(),
                row.venueName(),

                row.venueHallId(),
                row.venueHallName(),

                row.ticketCount(),
                row.totalAmount(),

                row.paymentId(),
                row.paymentNumber(),
                row.paymentProvider(),
                row.paymentMethod(),
                row.paymentStatus(),

                row.paymentApprovedAt(),

                row.expiresAt(),
                row.completedAt(),
                row.cancelledAt(),
                row.reservedAt()
        );
    }
}
