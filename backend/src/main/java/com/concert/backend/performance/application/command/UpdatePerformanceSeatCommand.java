package com.concert.backend.performance.application.command;

import com.concert.backend.performance.domain.SeatGrade;

public record UpdatePerformanceSeatCommand(
        SeatGrade grade,
        Long price
) {
}
