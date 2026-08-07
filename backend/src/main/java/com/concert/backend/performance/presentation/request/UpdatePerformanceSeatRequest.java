package com.concert.backend.performance.presentation.request;

import com.concert.backend.performance.application.command.UpdatePerformanceSeatCommand;
import com.concert.backend.performance.domain.SeatGrade;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdatePerformanceSeatRequest(

        @NotNull
        SeatGrade grade,

        @NotNull
        @Min(0)
        Long price
) {

    public UpdatePerformanceSeatCommand toCommand() {
        return new UpdatePerformanceSeatCommand(
                grade,
                price
        );
    }
}
