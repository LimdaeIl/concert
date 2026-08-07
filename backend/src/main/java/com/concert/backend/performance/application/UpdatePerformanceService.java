package com.concert.backend.performance.application;

import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import com.concert.backend.performance.application.command.UpdatePerformanceCommand;
import com.concert.backend.performance.application.result.PerformanceResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdatePerformanceService {

    private final ConcertRepository concertRepository;
    private final VenueRepository venueRepository;
    private final VenueHallRepository venueHallRepository;
    private final PerformanceRepository performanceRepository;

    @Transactional
    public PerformanceResult update(
            Long performanceId,
            UpdatePerformanceCommand command
    ) {
        Performance performance = performanceRepository
                .findById(performanceId)
                .orElseThrow(() ->
                        new PerformanceException(
                                PerformanceErrorCode.PERFORMANCE_NOT_FOUND
                        )
                );

        Concert concert = concertRepository
                .findById(performance.getConcertId())
                .orElseThrow(() ->
                        new ConcertException(
                                ConcertErrorCode.CONCERT_NOT_FOUND
                        )
                );

        if (!concert.isPublished()) {
            throw new PerformanceException(
                    PerformanceErrorCode.CONCERT_NOT_AVAILABLE
            );
        }

        VenueHall venueHall = venueHallRepository
                .findById(command.venueHallId())
                .orElseThrow(() ->
                        new VenueHallException(
                                VenueHallErrorCode.VENUE_HALL_NOT_FOUND
                        )
                );

        if (!venueHall.isActive()) {
            throw new PerformanceException(
                    PerformanceErrorCode.VENUE_HALL_NOT_AVAILABLE
            );
        }

        Venue venue = venueRepository
                .findById(venueHall.getVenueId())
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
                        )
                );

        if (!venue.isActive()) {
            throw new PerformanceException(
                    PerformanceErrorCode.VENUE_HALL_NOT_AVAILABLE
            );
        }

        if (performanceRepository
                .existsOverlappingPerformanceAndIdNot(
                        command.venueHallId(),
                        command.startsAt(),
                        command.endsAt(),
                        performanceId
                )) {
            throw new PerformanceException(
                    PerformanceErrorCode.PERFORMANCE_TIME_CONFLICT
            );
        }

        performance.update(
                command.venueHallId(),
                command.startsAt(),
                command.endsAt(),
                command.reservationOpensAt(),
                command.reservationClosesAt(),
                command.maxTicketsPerMember()
        );

        return PerformanceResult.from(performance);
    }
}
