package com.concert.backend.venuehall.query;

import com.concert.backend.venuehall.domain.VenueHallStatus;

public record AdminVenueHallSearchCondition(
        Long venueId,
        String keyword,
        VenueHallStatus status,
        int size,
        long offset
) {
}
