package com.concert.backend.venuehall.query;

import com.concert.backend.venuehall.domain.VenueHallStatus;

public record AdminVenueHallQueryRow(
        Long venueHallId,
        Long venueId,
        String name,
        String floor,
        Integer capacity,
        VenueHallStatus status
) {
}
