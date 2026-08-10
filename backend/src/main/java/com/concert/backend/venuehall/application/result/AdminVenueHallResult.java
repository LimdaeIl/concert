package com.concert.backend.venuehall.application.result;

import com.concert.backend.venuehall.domain.VenueHallStatus;
import com.concert.backend.venuehall.query.AdminVenueHallQueryRow;

public record AdminVenueHallResult(
        Long venueHallId,
        Long venueId,
        String name,
        String floor,
        Integer capacity,
        VenueHallStatus status
) {

    public static AdminVenueHallResult from(
            AdminVenueHallQueryRow row
    ) {
        return new AdminVenueHallResult(
                row.venueHallId(),
                row.venueId(),
                row.name(),
                row.floor(),
                row.capacity(),
                row.status()
        );
    }
}
