package com.concert.backend.performance.application.result;

import com.concert.backend.performance.query.AdminPerformanceSeatCandidateRow;
import com.concert.backend.venuehall.domain.SeatType;

public record AdminPerformanceSeatCandidateResult(
        Long seatId,
        Long venueHallId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        SeatType seatType
) {

    public static AdminPerformanceSeatCandidateResult from(
            AdminPerformanceSeatCandidateRow row
    ) {
        return new AdminPerformanceSeatCandidateResult(
                row.seatId(),
                row.venueHallId(),
                row.sectionName(),
                row.floor(),
                row.rowName(),
                row.seatNumber(),
                row.seatType()
        );
    }
}
