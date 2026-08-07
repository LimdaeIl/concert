package com.concert.backend.venue.application;

import com.concert.backend.venue.application.command.UpdateVenueStatusCommand;
import com.concert.backend.venue.application.result.VenueResult;
import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdateVenueStatusService {

    private final VenueRepository venueRepository;

    @Transactional
    public VenueResult updateStatus(
            Long venueId,
            UpdateVenueStatusCommand command
    ) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
                        )
                );

        venue.changeStatus(command.status());

        return VenueResult.from(venue);
    }
}
