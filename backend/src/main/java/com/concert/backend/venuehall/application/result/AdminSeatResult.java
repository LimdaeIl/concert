package com.concert.backend.venuehall.application.result;

import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import com.concert.backend.venuehall.query.AdminSeatQueryRow;

public record AdminSeatResult(
        Long seatId,
        Long venueHallId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        SeatType seatType,
        SeatStatus status
) {

    public static AdminSeatResult from(
            AdminSeatQueryRow row
    ) {
        return new AdminSeatResult(
                row.seatId(),
                row.venueHallId(),
                row.sectionName(),
                row.floor(),
                row.rowName(),
                row.seatNumber(),
                row.seatType(),
                row.status()
        );
    }
}
