package com.concert.backend.booking.infrastructure.mybatis.dto;

import java.time.LocalDateTime;

public record MyBookingQueryDto(
        Long reservationId,
        String reservationNumber,
        String reservationStatus,

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

        Long ticketCount,
        Long totalAmount,

        Long paymentId,
        String paymentNumber,
        String paymentProvider,
        String paymentMethod,
        String paymentStatus,

        LocalDateTime approvedAt,
        LocalDateTime reservedAt,

        Boolean canCancel,
        String cancelType,
        Boolean requiresPayment,
        String refundStatus
) {
}
