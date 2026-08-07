package com.concert.backend.performance.application.result;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatType;

public record PerformanceSeatResult(
        Long performanceSeatId,
        Long performanceId,
        Long seatId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        SeatType seatType,
        SeatGrade grade,
        Long price,
        PerformanceSeatStatus status
) {

    public static PerformanceSeatResult from(
            PerformanceSeat performanceSeat
    ) {
        Seat seat = performanceSeat.getSeat();

        return new PerformanceSeatResult(
                performanceSeat.getId(),
                performanceSeat.getPerformance().getId(),
                seat.getId(),
                seat.getSectionName(),
                seat.getFloor(),
                seat.getRowName(),
                seat.getSeatNumber(),
                seat.getSeatType(),
                performanceSeat.getGrade(),
                performanceSeat.getPrice(),
                performanceSeat.getStatus()
        );
    }
}
