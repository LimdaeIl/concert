package com.concert.backend.performance.application.result;

import java.util.List;

public record AdminPerformanceSeatCandidatePageResult(
        Long performanceId,
        Long venueHallId,

        List<AdminPerformanceSeatCandidateResult> seats,

        int page,
        int size,

        long totalElements,
        int totalPages,

        boolean first,
        boolean last
) {

    public static AdminPerformanceSeatCandidatePageResult of(
            Long performanceId,
            Long venueHallId,
            List<AdminPerformanceSeatCandidateResult> seats,
            int page,
            int size,
            long totalElements
    ) {
        int totalPages =
                totalElements == 0
                        ? 0
                        : (int) (
                                (totalElements + size - 1)
                                        / size
                        );

        return new AdminPerformanceSeatCandidatePageResult(
                performanceId,
                venueHallId,
                seats,
                page,
                size,
                totalElements,
                totalPages,
                page == 0,
                totalPages == 0
                        || page >= totalPages - 1
        );
    }
}
