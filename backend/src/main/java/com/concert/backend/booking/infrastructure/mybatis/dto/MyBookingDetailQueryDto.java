package com.concert.backend.booking.infrastructure.mybatis.dto;

import java.time.LocalDateTime;

public record MyBookingDetailQueryDto(

        // Reservation
        Long reservationId,
        String reservationNumber,
        String reservationStatus,
        Long totalAmount,
        LocalDateTime expiresAt,
        LocalDateTime reservationCompletedAt,
        LocalDateTime reservationCancelledAt,
        LocalDateTime reservedAt,

        // Concert
        Long concertId,
        String concertTitle,
        String concertSubtitle,
        String concertCategory,
        Integer runningTime,
        String ageRating,
        String posterUrl,

        // Performance
        Long performanceId,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        LocalDateTime reservationOpensAt,
        LocalDateTime reservationClosesAt,

        // Venue
        Long venueId,
        String venueName,
        String venueRoadAddress,
        String venueJibunAddress,
        String venueDetailAddress,
        String venueZipCode,

        // VenueHall
        Long venueHallId,
        String venueHallName,
        String venueHallFloor,

        // Latest Payment
        Long paymentId,
        String paymentNumber,
        String paymentProvider,
        String paymentMethod,
        String providerPaymentId,
        Long paymentAmount,
        String paymentStatus,
        String failureCode,
        String failureMessage,
        LocalDateTime paymentRequestedAt,
        LocalDateTime paymentApprovedAt,
        LocalDateTime paymentCancelledAt,

        // Latest Payment Cancellation
        Long paymentCancellationId,
        String cancellationNumber,
        Long cancellationAmount,
        String cancellationReason,
        String cancellationStatus,
        LocalDateTime cancellationRequestedAt,
        LocalDateTime cancellationCompletedAt,

        Boolean canCancel,
        String cancelType,
        Boolean requiresPayment,
        String refundStatus
) {
}
