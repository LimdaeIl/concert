package com.concert.backend.concert.application.command;

import com.concert.backend.concert.domain.ConcertStatus;

public record UpdateConcertStatusCommand(
        ConcertStatus status
) {
}
