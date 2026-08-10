package com.concert.backend.reservation.presentation.response;

import com.concert.backend.reservation.application.result.AdminReservationResult;
import java.time.LocalDateTime;

public record AdminReservationResponse(
        Long reservationId,
        String reservationNumber,
        String reservationStatus,

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

    public static AdminReservationResponse from(
            AdminReservationResult result
    ) {
        return new AdminReservationResponse(
                result.reservationId(),
                result.reservationNumber(),
                result.reservationStatus().name(),

                result.memberId(),
                result.memberEmail(),
                result.memberName(),

                result.concertId(),
                result.concertTitle(),
                result.posterUrl(),

                result.performanceId(),
                result.startsAt(),
                result.endsAt(),

                result.venueId(),
                result.venueName(),

                result.venueHallId(),
                result.venueHallName(),

                result.ticketCount(),
                result.totalAmount(),

                result.paymentId(),
                result.paymentNumber(),
                result.paymentProvider(),
                result.paymentMethod(),
                result.paymentStatus(),

                result.paymentApprovedAt(),

                result.expiresAt(),
                result.completedAt(),
                result.cancelledAt(),
                result.reservedAt()
        );
    }
}
