package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidateResult;

public record AdminPerformanceSeatCandidateResponse(
        Long seatId,
        Long venueHallId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        String seatType
) {

    public static AdminPerformanceSeatCandidateResponse from(
            AdminPerformanceSeatCandidateResult result
    ) {
        return new AdminPerformanceSeatCandidateResponse(
                result.seatId(),
                result.venueHallId(),
                result.sectionName(),
                result.floor(),
                result.rowName(),
                result.seatNumber(),
                result.seatType().name()
        );
    }
}
