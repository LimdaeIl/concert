package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.PerformanceResult;
import java.util.List;

public record GetPerformancesResponse(
        List<PerformanceResponse> performances
) {

    public static GetPerformancesResponse from(
            List<PerformanceResult> results
    ) {
        return new GetPerformancesResponse(
                results.stream()
                        .map(PerformanceResponse::from)
                        .toList()
        );
    }
}
