package com.concert.backend.performance.presentation.request;

import com.concert.backend.performance.application.command.UpdatePerformanceStatusCommand;
import com.concert.backend.performance.domain.PerformanceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdatePerformanceStatusRequest(

        @Schema(
                description = "변경할 공연 회차 상태",
                example = "OPEN",
                allowableValues = {
                        "SCHEDULED",
                        "OPEN",
                        "SOLD_OUT",
                        "COMPLETED",
                        "CANCELLED"
                }
        )
        @NotNull
        PerformanceStatus status
) {

    public UpdatePerformanceStatusCommand toCommand() {
        return new UpdatePerformanceStatusCommand(status);
    }
}
