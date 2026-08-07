package com.concert.backend.booking.infrastructure.mybatis.dto;

public record MyBookingSeatQueryDto(
        Long reservationSeatId,
        Long performanceSeatId,
        Long seatId,

        String sectionName,
        Short floor,
        String rowName,
        String seatNumber,
        String seatType,

        String grade,
        Long price
) {
}
