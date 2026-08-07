package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.SeatResult;

public record SeatResponse(
        Long seatId,
        Long venueHallId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        String seatType,
        String status
) {

    public static SeatResponse from(
            SeatResult result
    ) {
        return new SeatResponse(
                result.seatId(),
                result.venueHallId(),
                result.sectionName(),
                result.floor(),
                result.rowName(),
                result.seatNumber(),
                result.seatType().name(),
                result.status().name()
        );
    }
}
