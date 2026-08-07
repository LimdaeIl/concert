package com.concert.backend.booking.presentation.response;

import com.concert.backend.booking.application.result.MyBookingDetailResult;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingDetailQueryDto;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingSeatQueryDto;
import java.time.LocalDateTime;
import java.util.List;

public record MyBookingDetailResponse(
        Long reservationId,
        String reservationNumber,
        String reservationStatus,
        Long totalAmount,

        LocalDateTime expiresAt,
        LocalDateTime completedAt,
        LocalDateTime cancelledAt,
        LocalDateTime reservedAt,

        Boolean canCancel,
        String cancelType,
        Boolean requiresPayment,
        String refundStatus,

        Concert concert,
        Performance performance,
        Venue venue,
        Payment payment,

        List<Seat> seats
) {

    public static MyBookingDetailResponse from(
            MyBookingDetailResult result
    ) {
        MyBookingDetailQueryDto booking =
                result.booking();

        return new MyBookingDetailResponse(
                booking.reservationId(),
                booking.reservationNumber(),
                booking.reservationStatus(),
                booking.totalAmount(),

                booking.expiresAt(),
                booking.reservationCompletedAt(),
                booking.reservationCancelledAt(),
                booking.reservedAt(),

                booking.canCancel(),
                booking.cancelType(),
                booking.requiresPayment(),
                booking.refundStatus(),

                Concert.from(booking),
                Performance.from(booking),
                Venue.from(booking),
                Payment.from(booking),

                result.seats()
                        .stream()
                        .map(Seat::from)
                        .toList()
        );
    }

    public record Concert(
            Long concertId,
            String title,
            String subtitle,
            String category,
            Integer runningTime,
            String ageRating,
            String posterUrl
    ) {

        public static Concert from(
                MyBookingDetailQueryDto result
        ) {
            return new Concert(
                    result.concertId(),
                    result.concertTitle(),
                    result.concertSubtitle(),
                    result.concertCategory(),
                    result.runningTime(),
                    result.ageRating(),
                    result.posterUrl()
            );
        }
    }

    public record Performance(
            Long performanceId,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            LocalDateTime reservationOpensAt,
            LocalDateTime reservationClosesAt
    ) {

        public static Performance from(
                MyBookingDetailQueryDto result
        ) {
            return new Performance(
                    result.performanceId(),
                    result.startsAt(),
                    result.endsAt(),
                    result.reservationOpensAt(),
                    result.reservationClosesAt()
            );
        }
    }

    public record Venue(
            Long venueId,
            String name,
            String roadAddress,
            String jibunAddress,
            String detailAddress,
            String zipCode,

            Long venueHallId,
            String venueHallName,
            String venueHallFloor
    ) {

        public static Venue from(
                MyBookingDetailQueryDto result
        ) {
            return new Venue(
                    result.venueId(),
                    result.venueName(),
                    result.venueRoadAddress(),
                    result.venueJibunAddress(),
                    result.venueDetailAddress(),
                    result.venueZipCode(),

                    result.venueHallId(),
                    result.venueHallName(),
                    result.venueHallFloor()
            );
        }
    }

    public record Payment(
            Long paymentId,
            String paymentNumber,
            String provider,
            String method,
            String providerPaymentId,
            Long amount,
            String status,
            String failureCode,
            String failureMessage,
            LocalDateTime requestedAt,
            LocalDateTime approvedAt,
            LocalDateTime cancelledAt,

            Cancellation cancellation
    ) {

        public static Payment from(
                MyBookingDetailQueryDto result
        ) {
            if (result.paymentId() == null) {
                return null;
            }

            return new Payment(
                    result.paymentId(),
                    result.paymentNumber(),
                    result.paymentProvider(),
                    result.paymentMethod(),
                    result.providerPaymentId(),
                    result.paymentAmount(),
                    result.paymentStatus(),
                    result.failureCode(),
                    result.failureMessage(),
                    result.paymentRequestedAt(),
                    result.paymentApprovedAt(),
                    result.paymentCancelledAt(),

                    Cancellation.from(result)
            );
        }
    }

    public record Cancellation(
            Long cancellationId,
            String cancellationNumber,
            Long amount,
            String reason,
            String status,
            LocalDateTime requestedAt,
            LocalDateTime completedAt
    ) {

        public static Cancellation from(
                MyBookingDetailQueryDto result
        ) {
            if (result.paymentCancellationId() == null) {
                return null;
            }

            return new Cancellation(
                    result.paymentCancellationId(),
                    result.cancellationNumber(),
                    result.cancellationAmount(),
                    result.cancellationReason(),
                    result.cancellationStatus(),
                    result.cancellationRequestedAt(),
                    result.cancellationCompletedAt()
            );
        }
    }

    public record Seat(
            Long reservationSeatId,
            Long performanceSeatId,
            Long seatId,

            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            String seatType,

            String grade,
            Long price
    ) {

        public static Seat from(
                MyBookingSeatQueryDto result
        ) {
            return new Seat(
                    result.reservationSeatId(),
                    result.performanceSeatId(),
                    result.seatId(),

                    result.sectionName(),
                    result.floor(),
                    result.rowName(),
                    result.seatNumber(),
                    result.seatType(),

                    result.grade(),
                    result.price()
            );
        }
    }
}
