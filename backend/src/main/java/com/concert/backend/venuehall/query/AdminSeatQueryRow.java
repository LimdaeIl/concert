package com.concert.backend.venuehall.query;

import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;

public record AdminSeatQueryRow(
        Long seatId,
        Long venueHallId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        SeatType seatType,
        SeatStatus status
) {
}
