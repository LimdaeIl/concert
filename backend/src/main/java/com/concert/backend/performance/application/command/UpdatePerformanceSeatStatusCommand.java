package com.concert.backend.performance.application.command;

import com.concert.backend.performance.domain.PerformanceSeatStatus;

public record UpdatePerformanceSeatStatusCommand(
        PerformanceSeatStatus status
) {
}
