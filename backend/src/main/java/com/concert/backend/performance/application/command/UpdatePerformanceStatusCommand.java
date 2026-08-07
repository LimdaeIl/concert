package com.concert.backend.performance.application.command;

import com.concert.backend.performance.domain.PerformanceStatus;

public record UpdatePerformanceStatusCommand(
        PerformanceStatus status
) {
}
