package com.concert.backend.booking.presentation.response;

import com.concert.backend.booking.application.result.MyBookingsResult;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingQueryDto;
import java.time.LocalDateTime;
import java.util.List;

public record MyBookingsResponse(
        List<Booking> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static MyBookingsResponse from(
            MyBookingsResult result
    ) {
        return new MyBookingsResponse(
                result.content()
                        .stream()
                        .map(Booking::from)
                        .toList(),
                result.page(),
                result.size(),
                result.totalElements(),
                result.totalPages()
        );
    }

    public record Booking(
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

            Payment payment,

            LocalDateTime reservedAt,

            Boolean canCancel,
            String cancelType,
            Boolean requiresPayment,
            String refundStatus
    ) {

        public static Booking from(
                MyBookingQueryDto result
        ) {
            return new Booking(
                    result.reservationId(),
                    result.reservationNumber(),
                    result.reservationStatus(),

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

                    Payment.from(result),

                    result.reservedAt(),

                    result.canCancel(),
                    result.cancelType(),
                    result.requiresPayment(),
                    result.refundStatus()
            );
        }
    }

    public record Payment(
            Long paymentId,
            String paymentNumber,
            String provider,
            String method,
            String status,
            LocalDateTime approvedAt
    ) {

        public static Payment from(
                MyBookingQueryDto result
        ) {
            if (result.paymentId() == null) {
                return null;
            }

            return new Payment(
                    result.paymentId(),
                    result.paymentNumber(),
                    result.paymentProvider(),
                    result.paymentMethod(),
                    result.paymentStatus(),
                    result.approvedAt()
            );
        }
    }
}
