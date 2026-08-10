package com.concert.backend.performance.query;

import com.concert.backend.venuehall.domain.SeatType;

public record AdminPerformanceSeatCandidateCondition(
        Long performanceId,
        Long venueHallId,
        String keyword,
        Short floor,
        SeatType seatType,
        int size,
        long offset
) {
}
