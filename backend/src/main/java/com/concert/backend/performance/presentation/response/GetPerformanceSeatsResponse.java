package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.PerformanceSeatResult;
import java.util.List;

public record GetPerformanceSeatsResponse(
        List<PerformanceSeatResponse> seats
) {

    public static GetPerformanceSeatsResponse from(
            List<PerformanceSeatResult> results
    ) {
        return new GetPerformanceSeatsResponse(
                results.stream()
                        .map(PerformanceSeatResponse::from)
                        .toList()
        );
    }
}
