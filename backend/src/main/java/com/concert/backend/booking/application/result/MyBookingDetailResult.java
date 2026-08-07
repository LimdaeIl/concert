package com.concert.backend.booking.application.result;

import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingDetailQueryDto;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingSeatQueryDto;
import java.util.List;

public record MyBookingDetailResult(
        MyBookingDetailQueryDto booking,
        List<MyBookingSeatQueryDto> seats
) {

    public static MyBookingDetailResult of(
            MyBookingDetailQueryDto booking,
            List<MyBookingSeatQueryDto> seats
    ) {
        return new MyBookingDetailResult(
                booking,
                List.copyOf(seats)
        );
    }
}
