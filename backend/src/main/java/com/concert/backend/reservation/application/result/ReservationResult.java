package com.concert.backend.reservation.application.result;

import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationSeat;
import com.concert.backend.reservation.domain.ReservationStatus;
import java.time.LocalDateTime;
import java.util.List;

public record ReservationResult(
        Long reservationId,
        String reservationNumber,
        Long memberId,
        Long performanceId,
        Long totalAmount,
        ReservationStatus status,
        LocalDateTime expiresAt,
        LocalDateTime completedAt,
        LocalDateTime cancelledAt,
        List<SeatResult> seats
) {

    public static ReservationResult from(
            Reservation reservation
    ) {
        return new ReservationResult(
                reservation.getId(),
                reservation.getReservationNumber(),
                reservation.getMemberId(),
                reservation.getPerformanceId(),
                reservation.getTotalAmount(),
                reservation.getStatus(),
                reservation.getExpiresAt(),
                reservation.getCompletedAt(),
                reservation.getCancelledAt(),
                reservation.getReservationSeats()
                        .stream()
                        .map(SeatResult::from)
                        .toList()
        );
    }

    public record SeatResult(
            Long reservationSeatId,
            Long performanceSeatId,
            String grade,
            Long price
    ) {

        public static SeatResult from(
                ReservationSeat seat
        ) {
            return new SeatResult(
                    seat.getId(),
                    seat.getPerformanceSeatId(),
                    seat.getGrade().name(),
                    seat.getPrice()
            );
        }
    }
}
