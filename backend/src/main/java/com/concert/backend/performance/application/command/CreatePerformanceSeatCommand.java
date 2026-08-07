package com.concert.backend.performance.application.command;

import com.concert.backend.performance.domain.SeatGrade;

public record CreatePerformanceSeatCommand(
        Long seatId,
        SeatGrade grade,
        Long price
) {
}
