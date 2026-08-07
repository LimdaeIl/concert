package com.concert.backend.venue.application;

import com.concert.backend.venue.application.result.VenueResult;
import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.domain.VenueStatus;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetVenueService {

    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public VenueResult getVenue(Long venueId) {
        Venue venue = venueRepository
                .findByIdAndStatus(
                        venueId,
                        VenueStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
                        )
                );

        return VenueResult.from(venue);
    }
}
