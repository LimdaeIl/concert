package com.concert.backend.venuehall.application.command;

import com.concert.backend.venuehall.domain.SeatStatus;

public record UpdateSeatStatusCommand(
        SeatStatus status
) {
}
