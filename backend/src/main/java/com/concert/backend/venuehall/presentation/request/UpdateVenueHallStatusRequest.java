package com.concert.backend.venuehall.presentation.request;

import com.concert.backend.venuehall.application.command.UpdateVenueHallStatusCommand;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateVenueHallStatusRequest(
        @Schema(
                description = "공연홀 상태",
                example = "ACTIVE",
                allowableValues = {
                        "ACTIVE",
                        "INACTIVE",
                        "MAINTENANCE"
                }
        )
        @NotNull(message = "공연홀 상태는 필수입니다.")
        VenueHallStatus status
) {

    public UpdateVenueHallStatusCommand toCommand() {
        return new UpdateVenueHallStatusCommand(
                status
        );
    }
}
