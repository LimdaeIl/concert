package com.concert.backend.performance.query;

import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.venuehall.domain.SeatType;

public record AdminPerformanceSeatSearchCondition(
        Long performanceId,
        String keyword,
        Short floor,
        SeatGrade grade,
        SeatType seatType,
        PerformanceSeatStatus status,
        int size,
        long offset
) {
}
