package com.concert.backend.performance.application.result;

import com.concert.backend.performance.domain.PerformanceStatus;
import java.util.List;

public record AdminPerformanceSeatCandidateMapResult(

        Long performanceId,
        Long venueHallId,

        PerformanceStatus performanceStatus,

        int candidateSeatCount,

        List<AdminPerformanceSeatCandidateMapSeatResult> seats

) {

    public static AdminPerformanceSeatCandidateMapResult of(
            Long performanceId,
            Long venueHallId,
            PerformanceStatus performanceStatus,
            List<AdminPerformanceSeatCandidateMapSeatResult> seats
    ) {
        return new AdminPerformanceSeatCandidateMapResult(
                performanceId,
                venueHallId,
                performanceStatus,
                seats.size(),
                seats
        );
    }
}
