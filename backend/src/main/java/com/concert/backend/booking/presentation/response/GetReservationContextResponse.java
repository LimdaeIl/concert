package com.concert.backend.booking.presentation.response;

import com.concert.backend.booking.application.result.ReservationContextResult;
import java.time.LocalDateTime;

public record GetReservationContextResponse(
        int maxTicketsPerMember,
        long reservedTicketCount,
        long remainingTicketCount,
        PendingReservationResponse pendingReservation
) {

    public static GetReservationContextResponse from(
            ReservationContextResult result
    ) {
        return new GetReservationContextResponse(
                result.maxTicketsPerMember(),
                result.reservedTicketCount(),
                result.remainingTicketCount(),
                result.pendingReservation() == null
                        ? null
                        : PendingReservationResponse.from(
                                result.pendingReservation()
                        )
        );
    }

    public record PendingReservationResponse(
            Long reservationId,
            String reservationNumber,
            long ticketCount,
            Long totalAmount,
            LocalDateTime expiresAt
    ) {

        private static PendingReservationResponse from(
                ReservationContextResult.PendingReservationResult result
        ) {
            return new PendingReservationResponse(
                    result.reservationId(),
                    result.reservationNumber(),
                    result.ticketCount(),
                    result.totalAmount(),
                    result.expiresAt()
            );
        }
    }
}
