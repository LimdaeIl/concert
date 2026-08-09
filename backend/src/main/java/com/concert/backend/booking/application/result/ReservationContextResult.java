package com.concert.backend.booking.application.result;

import java.time.LocalDateTime;

public record ReservationContextResult(
        int maxTicketsPerMember,
        long reservedTicketCount,
        long remainingTicketCount,
        PendingReservationResult pendingReservation
) {

    public record PendingReservationResult(
            Long reservationId,
            String reservationNumber,
            long ticketCount,
            Long totalAmount,
            LocalDateTime expiresAt
    ) {
    }
}
