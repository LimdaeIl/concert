package com.concert.backend.concert.application.result;

import java.util.List;

public record AdminConcertPageResult(
        List<AdminConcertResult> concerts,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static AdminConcertPageResult of(
            List<AdminConcertResult> concerts,
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

        return new AdminConcertPageResult(
                concerts,
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
