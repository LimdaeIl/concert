package com.concert.backend.venue.application;

import com.concert.backend.common.domain.Address;
import com.concert.backend.venue.application.command.UpdateVenueCommand;
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
public class UpdateVenueService {

    private final VenueRepository venueRepository;

    @Transactional
    public VenueResult update(
            Long venueId,
            UpdateVenueCommand command
    ) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
                        )
                );

        validateDuplicateVenue(
                venueId,
                command.name(),
                command.roadAddress()
        );

        Address address = Address.of(
                command.roadAddress(),
                command.jibunAddress(),
                command.detailAddress(),
                command.zipCode(),
                command.latitude(),
                command.longitude()
        );

        venue.update(
                command.name(),
                command.phone(),
                address
        );

        return VenueResult.from(venue);
    }

    private void validateDuplicateVenue(
            Long venueId,
            String name,
            String roadAddress
    ) {
        if (venueRepository
                .existsByNameAndRoadAddressAndIdNot(
                        name,
                        roadAddress,
                        venueId
                )) {
            throw new VenueException(
                    VenueErrorCode.DUPLICATE_VENUE
            );
        }
    }
}
