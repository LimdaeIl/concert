package com.concert.backend.venuehall.application;

import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.domain.VenueStatus;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import com.concert.backend.venuehall.exception.SeatErrorCode;
import com.concert.backend.venuehall.exception.SeatException;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetSeatService {

    private final SeatRepository seatRepository;
    private final VenueHallRepository venueHallRepository;
    private final VenueRepository venueRepository;

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

        VenueHall venueHall = seat.getVenueHall();

        venueHallRepository.findByIdAndStatus(
                        venueHall.getId(),
                        VenueHallStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new VenueHallException(
                                VenueHallErrorCode.VENUE_HALL_NOT_FOUND
                        )
                );

        venueRepository.findByIdAndStatus(
                        venueHall.getVenueId(),
                        VenueStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
                        )
                );

        return SeatResult.from(seat);
    }
}
