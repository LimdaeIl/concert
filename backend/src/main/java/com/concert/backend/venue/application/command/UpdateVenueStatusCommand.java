package com.concert.backend.venue.application.command;

import com.concert.backend.venue.domain.VenueStatus;

public record UpdateVenueStatusCommand(
        VenueStatus status
) {
}
