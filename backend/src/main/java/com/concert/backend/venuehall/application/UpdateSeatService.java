package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.command.UpdateSeatCommand;
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
public class UpdateSeatService {

    private final SeatRepository seatRepository;

    @Transactional
    public SeatResult update(
            Long seatId,
            UpdateSeatCommand command
    ) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() ->
                        new SeatException(
                                SeatErrorCode.SEAT_NOT_FOUND
                        )
                );

        Long venueHallId =
                seat.getVenueHall().getId();

        if (seatRepository.existsByPositionAndIdNot(
                venueHallId,
                command.sectionName(),
                command.floor(),
                command.rowName(),
                command.seatNumber(),
                seatId
        )) {
            throw new SeatException(
                    SeatErrorCode.DUPLICATE_SEAT_POSITION
            );
        }

        seat.update(
                command.sectionName(),
                command.floor(),
                command.rowName(),
                command.seatNumber(),
                command.seatType()
        );

        return SeatResult.from(seat);
    }
}
