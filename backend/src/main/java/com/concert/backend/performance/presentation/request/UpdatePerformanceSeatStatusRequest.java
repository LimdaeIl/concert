package com.concert.backend.performance.presentation.request;

import com.concert.backend.performance.application.command.UpdatePerformanceSeatStatusCommand;
import com.concert.backend.performance.domain.PerformanceSeatStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePerformanceSeatStatusRequest(
        @NotNull
        PerformanceSeatStatus status
) {

    public UpdatePerformanceSeatStatusCommand toCommand() {
        return new UpdatePerformanceSeatStatusCommand(
                status
        );
    }
}
