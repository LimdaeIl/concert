package com.concert.backend.reservation.application.command;

import java.util.List;

public record CreateReservationCommand(
        List<Long> performanceSeatIds
) {
}
