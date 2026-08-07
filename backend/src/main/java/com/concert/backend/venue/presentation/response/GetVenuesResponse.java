package com.concert.backend.venue.presentation.response;

import com.concert.backend.venue.application.result.VenueResult;
import java.util.List;

public record GetVenuesResponse(
        List<VenueResponse> venues
) {

    public static GetVenuesResponse from(
            List<VenueResult> results
    ) {
        return new GetVenuesResponse(
                results.stream()
                        .map(VenueResponse::from)
                        .toList()
        );
    }
}
