package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.VenueHallResult;
import java.util.List;

public record GetVenueHallsResponse(
        List<VenueHallResponse> halls
) {

    public static GetVenueHallsResponse from(
            List<VenueHallResult> results
    ) {
        return new GetVenueHallsResponse(
                results.stream()
                        .map(VenueHallResponse::from)
                        .toList()
        );
    }
}
