package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.AdminPerformancePageResult;
import java.util.List;

public record GetAdminPerformancesResponse(
        List<AdminPerformanceResponse> performances,

        int page,
        int size,

        long totalElements,
        int totalPages,

        boolean first,
        boolean last
) {

    public static GetAdminPerformancesResponse from(
            AdminPerformancePageResult result
    ) {
        return new GetAdminPerformancesResponse(
                result.performances()
                        .stream()
                        .map(
                                AdminPerformanceResponse::from
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
