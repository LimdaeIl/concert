package com.concert.backend.performance.query;

import com.concert.backend.venuehall.domain.SeatType;

public record AdminPerformanceSeatCandidateMapQueryRow(

        Long seatId,
        Long venueHallId,

        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,

        SeatType seatType

) {
}
