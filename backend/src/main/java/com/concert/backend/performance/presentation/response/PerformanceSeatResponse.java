package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.PerformanceSeatResult;

public record PerformanceSeatResponse(
        Long performanceSeatId,
        Long performanceId,
        Long seatId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        String seatType,
        String grade,
        Long price,
        String status
) {

    public static PerformanceSeatResponse from(
            PerformanceSeatResult result
    ) {
        return new PerformanceSeatResponse(
                result.performanceSeatId(),
                result.performanceId(),
                result.seatId(),
                result.sectionName(),
                result.floor(),
                result.rowName(),
                result.seatNumber(),
                result.seatType().name(),
                result.grade().name(),
                result.price(),
                result.status().name()
        );
    }
}
