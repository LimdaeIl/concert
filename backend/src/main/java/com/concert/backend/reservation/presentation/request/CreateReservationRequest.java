package com.concert.backend.reservation.presentation.request;

import com.concert.backend.reservation.application.command.CreateReservationCommand;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateReservationRequest(

        @NotEmpty(
                message = "예약할 좌석을 선택해주세요."
        )
        List<
                @NotNull
                        Long
                > performanceSeatIds
) {

    public CreateReservationCommand toCommand() {
        return new CreateReservationCommand(
                performanceSeatIds
        );
    }
}
