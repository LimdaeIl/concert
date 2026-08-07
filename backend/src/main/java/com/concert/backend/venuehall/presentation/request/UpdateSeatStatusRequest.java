package com.concert.backend.venuehall.presentation.request;

import com.concert.backend.venuehall.application.command.UpdateSeatStatusCommand;
import com.concert.backend.venuehall.domain.SeatStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateSeatStatusRequest(
        @Schema(
                description = "변경할 좌석 상태",
                example = "MAINTENANCE",
                allowableValues = {
                        "ACTIVE",
                        "INACTIVE",
                        "MAINTENANCE"
                }
        )
        @NotNull
        SeatStatus status
) {

    public UpdateSeatStatusCommand toCommand() {
        return new UpdateSeatStatusCommand(status);
    }
}
