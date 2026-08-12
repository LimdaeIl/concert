package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidateMapResult;
import java.util.List;

public record GetAdminPerformanceSeatCandidateMapResponse(

        Long performanceId,
        Long venueHallId,

        String performanceStatus,

        int candidateSeatCount,

        List<AdminPerformanceSeatCandidateMapSeatResponse> seats

) {

    public static GetAdminPerformanceSeatCandidateMapResponse from(
            AdminPerformanceSeatCandidateMapResult result
    ) {
        return new GetAdminPerformanceSeatCandidateMapResponse(
                result.performanceId(),
                result.venueHallId(),

                result.performanceStatus().name(),

                result.candidateSeatCount(),

                result.seats()
                        .stream()
                        .map(
                                AdminPerformanceSeatCandidateMapSeatResponse::from
                        )
                        .toList()
        );
    }
}
