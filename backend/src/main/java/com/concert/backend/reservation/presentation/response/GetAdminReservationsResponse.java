package com.concert.backend.reservation.presentation.response;

import com.concert.backend.reservation.application.result.AdminReservationPageResult;
import java.util.List;

public record GetAdminReservationsResponse(
        List<AdminReservationResponse> reservations,

        int page,
        int size,

        long totalElements,
        int totalPages,

        boolean first,
        boolean last
) {

    public static GetAdminReservationsResponse from(
            AdminReservationPageResult result
    ) {
        return new GetAdminReservationsResponse(
                result.reservations()
                        .stream()
                        .map(
                                AdminReservationResponse::from
                        )
                        .toList(),

                result.page(),
                result.size(),

                result.totalElements(),
                result.totalPages(),

                result.first(),
                result.last()
        );
    }
}
