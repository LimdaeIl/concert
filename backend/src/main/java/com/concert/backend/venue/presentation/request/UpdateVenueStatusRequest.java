package com.concert.backend.venue.presentation.request;

import com.concert.backend.venue.application.command.UpdateVenueStatusCommand;
import com.concert.backend.venue.domain.VenueStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateVenueStatusRequest(

        @Schema(
                description = "변경할 공연장 상태",
                example = "INACTIVE",
                allowableValues = {
                        "ACTIVE",
                        "INACTIVE"
                }
        )
        @NotNull(message = "공연장 상태는 필수입니다.")
        VenueStatus status
) {

    public UpdateVenueStatusCommand toCommand() {
        return new UpdateVenueStatusCommand(status);
    }
}
