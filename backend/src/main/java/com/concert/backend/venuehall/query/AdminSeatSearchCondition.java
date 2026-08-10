package com.concert.backend.venuehall.query;

import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;

public record AdminSeatSearchCondition(
        Long venueHallId,
        String keyword,
        Short floor,
        SeatType seatType,
        SeatStatus status,
        int size,
        long offset
) {
}
