package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.AdminPerformanceSeatResult;
import java.time.LocalDateTime;

public record AdminPerformanceSeatResponse(
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
        String status,

        Long heldBy,
        LocalDateTime heldUntil
) {

    public static AdminPerformanceSeatResponse from(
            AdminPerformanceSeatResult result
    ) {
        return new AdminPerformanceSeatResponse(
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
                result.status().name(),

                result.heldBy(),
                result.heldUntil()
        );
    }
}
