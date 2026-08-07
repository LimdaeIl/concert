package com.concert.backend.venue.application;

import com.concert.backend.common.domain.Address;
import com.concert.backend.venue.application.command.CreateVenueCommand;
import com.concert.backend.venue.application.result.CreateVenueResult;
import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CreateVenueService {

    private final VenueRepository venueRepository;

    @Transactional
    public CreateVenueResult create(CreateVenueCommand command) {
        validateDuplicateVenue(command.name(), command.roadAddress());

        Address address = Address.of(
                command.roadAddress(),
                command.jibunAddress(),
                command.detailAddress(),
                command.zipCode(),
                command.latitude(),
                command.longitude()
        );

        Venue venue = Venue.create(
                command.name(),
                command.phone(),
                address
        );

        Venue savedVenue = venueRepository.save(venue);

        return CreateVenueResult.from(savedVenue);
    }

    private void validateDuplicateVenue(String name, String roadAddress) {
        if (venueRepository.existsByNameAndRoadAddress(name, roadAddress)) {
            throw new VenueException(VenueErrorCode.DUPLICATE_VENUE);
        }
    }
}
