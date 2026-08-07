package com.concert.backend.venuehall.application.result;

import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallStatus;

public record VenueHallResult(
        Long venueHallId,
        Long venueId,
        String name,
        String floor,
        Integer capacity,
        VenueHallStatus status
) {

    public static VenueHallResult from(
            VenueHall venueHall
    ) {
        return new VenueHallResult(
                venueHall.getId(),
                venueHall.getVenueId(),
                venueHall.getName(),
                venueHall.getFloor(),
                venueHall.getCapacity(),
                venueHall.getStatus()
        );
    }
}
