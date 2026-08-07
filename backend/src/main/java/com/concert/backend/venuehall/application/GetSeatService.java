package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.exception.SeatErrorCode;
import com.concert.backend.venuehall.exception.SeatException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetSeatService {

    private final SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public SeatResult getSeat(Long seatId) {
        Seat seat = seatRepository
                .findByIdAndStatus(
                        seatId,
                        SeatStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new SeatException(
                                SeatErrorCode.SEAT_NOT_FOUND
                        )
                );

        return SeatResult.from(seat);
    }
}
