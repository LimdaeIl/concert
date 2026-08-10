package com.concert.backend.venuehall.application.result;

import java.util.List;

public record AdminVenueHallPageResult(
        List<AdminVenueHallResult> halls,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static AdminVenueHallPageResult of(
            List<AdminVenueHallResult> halls,
            int page,
            int size,
            long totalElements
    ) {
        int totalPages =
                calculateTotalPages(
                        totalElements,
                        size
                );

        return new AdminVenueHallPageResult(
                halls,
                page,
                size,
                totalElements,
                totalPages,
                page == 0,
                totalPages == 0
                        || page >= totalPages - 1
        );
    }

    private static int calculateTotalPages(
            long totalElements,
            int size
    ) {
        if (totalElements == 0) {
            return 0;
        }

        return (int) (
                (totalElements + size - 1)
                        / size
        );
    }
}
