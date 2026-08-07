package com.concert.backend.reservation.presentation.response;

import com.concert.backend.reservation.application.result.ReservationResult;
import java.util.List;

public record GetReservationsResponse(
        List<ReservationResponse> reservations
) {

    public static GetReservationsResponse from(
            List<ReservationResult> results
    ) {
        return new GetReservationsResponse(
                results.stream()
                        .map(ReservationResponse::from)
                        .toList()
        );
    }
}
