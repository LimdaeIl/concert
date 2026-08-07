package com.concert.backend.venuehall.presentation.request;

import com.concert.backend.venuehall.application.command.UpdateVenueHallStatusCommand;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateVenueHallStatusRequest(

        @NotNull(message = "공연홀 상태는 필수입니다.")
        VenueHallStatus status
) {

    public UpdateVenueHallStatusCommand toCommand() {
        return new UpdateVenueHallStatusCommand(
                status
        );
    }
}
