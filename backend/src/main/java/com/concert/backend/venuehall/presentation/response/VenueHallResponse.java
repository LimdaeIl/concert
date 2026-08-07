package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.VenueHallResult;

public record VenueHallResponse(
        Long venueHallId,
        Long venueId,
        String name,
        String floor,
        Integer capacity,
        String status
) {

    public static VenueHallResponse from(
            VenueHallResult result
    ) {
        return new VenueHallResponse(
                result.venueHallId(),
                result.venueId(),
                result.name(),
                result.floor(),
                result.capacity(),
                result.status().name()
        );
    }
}
