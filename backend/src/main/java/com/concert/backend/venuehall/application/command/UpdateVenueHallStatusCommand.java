package com.concert.backend.venuehall.application.command;

import com.concert.backend.venuehall.domain.VenueHallStatus;

public record UpdateVenueHallStatusCommand(
        VenueHallStatus status
) {
}
