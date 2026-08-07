package com.concert.backend.booking.application.result;

import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingQueryDto;
import java.util.List;

public record MyBookingsResult(
        List<MyBookingQueryDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static MyBookingsResult of(
            List<MyBookingQueryDto> content,
            int page,
            int size,
            long totalElements
    ) {
        int totalPages =
                size == 0
                        ? 0
                        : (int) Math.ceil(
                                (double) totalElements
                                        / size
                        );

        return new MyBookingsResult(
                content,
                page,
                size,
                totalElements,
                totalPages
        );
    }
}
