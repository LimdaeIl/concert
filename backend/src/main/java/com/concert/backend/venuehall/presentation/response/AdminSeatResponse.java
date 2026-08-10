package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.AdminSeatResult;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;

public record AdminSeatResponse(
        Long seatId,
        Long venueHallId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        SeatType seatType,
        SeatStatus status
) {

    public static AdminSeatResponse from(
            AdminSeatResult result
    ) {
        return new AdminSeatResponse(
                result.seatId(),
                result.venueHallId(),
                result.sectionName(),
                result.floor(),
                result.rowName(),
                result.seatNumber(),
                result.seatType(),
                result.status()
        );
    }
}
