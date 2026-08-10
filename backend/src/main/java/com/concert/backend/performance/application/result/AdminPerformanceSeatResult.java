package com.concert.backend.performance.application.result;

import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.performance.query.AdminPerformanceSeatQueryRow;
import com.concert.backend.venuehall.domain.SeatType;
import java.time.LocalDateTime;

public record AdminPerformanceSeatResult(
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
        PerformanceSeatStatus status,

        Long heldBy,
        LocalDateTime heldUntil
) {

    public static AdminPerformanceSeatResult from(
            AdminPerformanceSeatQueryRow row
    ) {
        return new AdminPerformanceSeatResult(
                row.performanceSeatId(),
                row.performanceId(),
                row.seatId(),

                row.sectionName(),
                row.floor(),
                row.rowName(),
                row.seatNumber(),
                row.seatType(),

                row.grade(),
                row.price(),
                row.status(),

                row.heldBy(),
                row.heldUntil()
        );
    }
}
