package com.concert.backend.reservation.presentation.response;

import com.concert.backend.reservation.application.result.ReservationResult;
import java.time.LocalDateTime;
import java.util.List;

public record ReservationResponse(
        Long reservationId,
        String reservationNumber,
        Long performanceId,
        Long totalAmount,
        String status,
        LocalDateTime expiresAt,
        LocalDateTime completedAt,
        LocalDateTime cancelledAt,
        List<ReservationSeatResponse> seats
) {

    public static ReservationResponse from(
            ReservationResult result
    ) {
        return new ReservationResponse(
                result.reservationId(),
                result.reservationNumber(),
                result.performanceId(),
                result.totalAmount(),
                result.status().name(),
                result.expiresAt(),
                result.completedAt(),
                result.cancelledAt(),
                result.seats()
                        .stream()
                        .map(ReservationSeatResponse::from)
                        .toList()
        );
    }

    public record ReservationSeatResponse(
            Long reservationSeatId,
            Long performanceSeatId,
            String grade,
            Long price
    ) {

        public static ReservationSeatResponse from(
                ReservationResult.SeatResult result
        ) {
            return new ReservationSeatResponse(
                    result.reservationSeatId(),
                    result.performanceSeatId(),
                    result.grade(),
                    result.price()
            );
        }
    }
}
