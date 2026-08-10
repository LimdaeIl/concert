package com.concert.backend.reservation.application.result;

import java.util.List;

public record AdminReservationPageResult(
        List<AdminReservationResult> reservations,

        int page,
        int size,

        long totalElements,
        int totalPages,

        boolean first,
        boolean last
) {

    public static AdminReservationPageResult of(
            List<AdminReservationResult> reservations,
            int page,
            int size,
            long totalElements
    ) {
        int totalPages =
                totalElements == 0
                        ? 0
                        : (int) (
                                (totalElements + size - 1)
                                        / size
                        );

        return new AdminReservationPageResult(
                reservations,
                page,
                size,
                totalElements,
                totalPages,
                page == 0,
                totalPages == 0
                        || page >= totalPages - 1
        );
    }
}
