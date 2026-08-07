package com.concert.backend.booking.application;

import com.concert.backend.booking.application.result.MyBookingDetailResult;
import com.concert.backend.booking.infrastructure.mybatis.MyBookingMapper;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingDetailQueryDto;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingSeatQueryDto;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetMyBookingDetailService {

    private final MyBookingMapper myBookingMapper;

    @Transactional(readOnly = true)
    public MyBookingDetailResult getBooking(
            Long memberId,
            Long reservationId
    ) {
        MyBookingDetailQueryDto booking =
                myBookingMapper
                        .findDetail(
                                memberId,
                                reservationId
                        )
                        .orElseThrow(() ->
                                new ReservationException(
                                        ReservationErrorCode.RESERVATION_NOT_FOUND
                                )
                        );

        List<MyBookingSeatQueryDto> seats =
                myBookingMapper.findSeats(
                        memberId,
                        reservationId
                );

        return MyBookingDetailResult.of(
                booking,
                seats
        );
    }
}
