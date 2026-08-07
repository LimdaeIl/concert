package com.concert.backend.venuehall.application.command;

import com.concert.backend.venuehall.domain.SeatType;

public record UpdateSeatCommand(
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        SeatType seatType
) {
}
