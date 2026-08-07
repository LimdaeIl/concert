package com.concert.backend.venuehall.application.result;

import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;

public record SeatResult(
        Long seatId,
        Long venueHallId,
        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        SeatType seatType,
        SeatStatus status
) {

    public static SeatResult from(Seat seat) {
        return new SeatResult(
                seat.getId(),
                seat.getVenueHall().getId(),
                seat.getSectionName(),
                seat.getFloor(),
                seat.getRowName(),
                seat.getSeatNumber(),
                seat.getSeatType(),
                seat.getStatus()
        );
    }
}
