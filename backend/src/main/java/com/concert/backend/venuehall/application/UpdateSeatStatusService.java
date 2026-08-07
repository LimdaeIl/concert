package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.command.UpdateSeatStatusCommand;
import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.exception.SeatErrorCode;
import com.concert.backend.venuehall.exception.SeatException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdateSeatStatusService {

    private final SeatRepository seatRepository;

    @Transactional
    public SeatResult updateStatus(
            Long seatId,
            UpdateSeatStatusCommand command
    ) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() ->
                        new SeatException(
                                SeatErrorCode.SEAT_NOT_FOUND
                        )
                );

        seat.changeStatus(command.status());

        return SeatResult.from(seat);
    }
}
