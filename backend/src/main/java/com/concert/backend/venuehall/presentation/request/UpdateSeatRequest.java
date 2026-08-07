package com.concert.backend.venuehall.presentation.request;

import com.concert.backend.venuehall.application.command.UpdateSeatCommand;
import com.concert.backend.venuehall.domain.SeatType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateSeatRequest(

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

        @NotNull
        SeatType seatType
) {

    public UpdateSeatCommand toCommand() {
        return new UpdateSeatCommand(
                sectionName,
                floor,
                rowName,
                seatNumber,
                seatType
        );
    }
}
