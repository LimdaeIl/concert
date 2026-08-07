package com.concert.backend.venuehall.presentation.request;

import com.concert.backend.venuehall.application.command.UpdateSeatStatusCommand;
import com.concert.backend.venuehall.domain.SeatStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateSeatStatusRequest(

        @NotNull
        SeatStatus status
) {

    public UpdateSeatStatusCommand toCommand() {
        return new UpdateSeatStatusCommand(status);
    }
}
