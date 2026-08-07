package com.concert.backend.concert.presentation.request;

import com.concert.backend.concert.application.command.UpdateConcertStatusCommand;
import com.concert.backend.concert.domain.ConcertStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateConcertStatusRequest(

        @Schema(
                description = "변경할 공연 상태",
                example = "PUBLISHED",
                allowableValues = {
                        "DRAFT",
                        "PUBLISHED",
                        "CLOSED",
                        "CANCELLED"
                }
        )
        @NotNull(message = "공연 상태는 필수입니다.")
        ConcertStatus status
) {

    public UpdateConcertStatusCommand toCommand() {
        return new UpdateConcertStatusCommand(status);
    }
}
