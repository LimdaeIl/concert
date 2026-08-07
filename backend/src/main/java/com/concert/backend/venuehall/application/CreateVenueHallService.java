package com.concert.backend.venuehall.application;

import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import com.concert.backend.venuehall.application.command.CreateVenueHallCommand;
import com.concert.backend.venuehall.application.result.VenueHallResult;
import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CreateVenueHallService {

    private final VenueRepository venueRepository;
    private final VenueHallRepository venueHallRepository;

    @Transactional
    public VenueHallResult create(
            Long venueId,
            CreateVenueHallCommand command
    ) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
                        )
                );

        if (!venue.isActive()) {
            throw new VenueHallException(
                    VenueHallErrorCode.VENUE_NOT_AVAILABLE
            );
        }

        validateDuplicateName(
                venueId,
                command.name()
        );

        VenueHall venueHall = VenueHall.create(
                venueId,
                command.name(),
                command.floor(),
                command.capacity()
        );

        VenueHall savedVenueHall =
                venueHallRepository.save(venueHall);

        return VenueHallResult.from(savedVenueHall);
    }

    private void validateDuplicateName(
            Long venueId,
            String name
    ) {
        if (venueHallRepository.existsByVenueIdAndName(
                venueId,
                name
        )) {
            throw new VenueHallException(
                    VenueHallErrorCode.DUPLICATE_VENUE_HALL
            );
        }
    }
}