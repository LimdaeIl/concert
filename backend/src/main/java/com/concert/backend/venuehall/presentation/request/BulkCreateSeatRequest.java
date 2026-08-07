package com.concert.backend.venuehall.presentation.request;

import com.concert.backend.venuehall.application.command.CreateSeatCommand;
import com.concert.backend.venuehall.domain.SeatType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BulkCreateSeatRequest(

        @NotEmpty(message = "생성할 좌석이 필요합니다.")
        @Valid
        List<SeatItem> seats
) {

    public List<CreateSeatCommand> toCommands() {
        return seats.stream()
                .map(SeatItem::toCommand)
                .toList();
    }

    public record SeatItem(

            @NotBlank
            @Size(max = 50)
            String sectionName,

            @NotNull
            @Min(1)
            Short floor,

            @NotBlank
            @Size(max = 20)
            String rowName,

            @NotBlank
            @Size(max = 20)
            String seatNumber,

            @Schema(
                    description = "좌석 유형",
                    example = "STANDARD",
                    allowableValues = {
                            "STANDARD",
                            "WHEELCHAIR",
                            "COMPANION",
                            "OBSTRUCTED_VIEW"
                    }
            )
            @NotNull
            SeatType seatType
    ) {

        public CreateSeatCommand toCommand() {
            return new CreateSeatCommand(
                    sectionName,
                    floor,
                    rowName,
                    seatNumber,
                    seatType
            );
        }
    }
}
