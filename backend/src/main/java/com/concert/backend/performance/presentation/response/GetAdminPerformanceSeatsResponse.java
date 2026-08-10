package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.AdminPerformanceSeatPageResult;
import java.util.List;

public record GetAdminPerformanceSeatsResponse(
        List<AdminPerformanceSeatResponse> seats,

        int page,
        int size,

        long totalElements,
        int totalPages,

        boolean first,
        boolean last
) {

    public static GetAdminPerformanceSeatsResponse from(
            AdminPerformanceSeatPageResult result
    ) {
        return new GetAdminPerformanceSeatsResponse(
                result.seats()
                        .stream()
                        .map(
                                AdminPerformanceSeatResponse::from
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
