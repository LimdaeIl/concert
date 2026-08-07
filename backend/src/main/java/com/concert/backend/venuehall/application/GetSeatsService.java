package com.concert.backend.venuehall.application;

import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.domain.VenueStatus;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetSeatsService {

    private final VenueHallRepository venueHallRepository;
    private final VenueRepository venueRepository;
    private final SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public List<SeatResult> getSeats(Long venueHallId) {
        VenueHall venueHall = venueHallRepository
                .findByIdAndStatus(
                        venueHallId,
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

        return seatRepository
                .findAllByVenueHallIdAndStatus(
                        venueHallId,
                        SeatStatus.ACTIVE
                )
                .stream()
                .map(SeatResult::from)
                .toList();
    }
}
