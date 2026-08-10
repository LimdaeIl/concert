package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidatePageResult;
import java.util.List;

public record GetAdminPerformanceSeatCandidatesResponse(
        Long performanceId,
        Long venueHallId,

        List<AdminPerformanceSeatCandidateResponse> seats,

        int page,
        int size,

        long totalElements,
        int totalPages,

        boolean first,
        boolean last
) {

    public static GetAdminPerformanceSeatCandidatesResponse from(
            AdminPerformanceSeatCandidatePageResult result
    ) {
        return new GetAdminPerformanceSeatCandidatesResponse(
                result.performanceId(),
                result.venueHallId(),

                result.seats()
                        .stream()
                        .map(
                                AdminPerformanceSeatCandidateResponse::from
                        )
                        .toList(),

                result.page(),
                result.size(),

                result.totalElements(),
                result.totalPages(),

                result.first(),
                result.last()
        );
    }
}
