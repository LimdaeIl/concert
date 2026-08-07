package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.SeatResult;
import java.util.List;

public record GetSeatsResponse(
        List<SeatResponse> seats
) {

    public static GetSeatsResponse from(
            List<SeatResult> results
    ) {
        return new GetSeatsResponse(
                results.stream()
                        .map(SeatResponse::from)
                        .toList()
        );
    }
}
