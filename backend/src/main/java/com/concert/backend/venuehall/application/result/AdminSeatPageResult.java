package com.concert.backend.venuehall.application.result;

import java.util.List;

public record AdminSeatPageResult(
        List<AdminSeatResult> seats,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static AdminSeatPageResult of(
            List<AdminSeatResult> seats,
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

        return new AdminSeatPageResult(
                seats,
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
