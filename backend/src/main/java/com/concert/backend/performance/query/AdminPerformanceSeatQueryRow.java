package com.concert.backend.performance.query;

import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.venuehall.domain.SeatType;
import java.time.LocalDateTime;

public record AdminPerformanceSeatQueryRow(
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
}
