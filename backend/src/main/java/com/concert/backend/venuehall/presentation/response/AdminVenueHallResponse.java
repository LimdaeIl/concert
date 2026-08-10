package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.AdminVenueHallResult;
import com.concert.backend.venuehall.domain.VenueHallStatus;

public record AdminVenueHallResponse(
        Long venueHallId,
        Long venueId,
        String name,
        String floor,
        Integer capacity,
        VenueHallStatus status
) {

    public static AdminVenueHallResponse from(
            AdminVenueHallResult result
    ) {
        return new AdminVenueHallResponse(
                result.venueHallId(),
                result.venueId(),
                result.name(),
                result.floor(),
                result.capacity(),
                result.status()
        );
    }
}
