package com.concert.backend.performance.application.result;

import com.concert.backend.performance.query.AdminPerformanceSeatCandidateMapQueryRow;
import com.concert.backend.venuehall.domain.SeatType;

public record AdminPerformanceSeatCandidateMapSeatResult(

        Long seatId,
        Long venueHallId,

        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,

        SeatType seatType

) {

    public static AdminPerformanceSeatCandidateMapSeatResult from(
            AdminPerformanceSeatCandidateMapQueryRow row
    ) {
        return new AdminPerformanceSeatCandidateMapSeatResult(
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

