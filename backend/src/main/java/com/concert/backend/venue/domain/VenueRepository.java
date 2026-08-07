package com.concert.backend.venue.domain;

import java.util.List;
import java.util.Optional;

public interface VenueRepository {

    Venue save(Venue venue);

    Optional<Venue> findById(Long venueId);

    List<Venue> findAll();

    boolean existsByNameAndRoadAddress(
            String name,
            String roadAddress
    );

    boolean existsByNameAndRoadAddressAndIdNot(
            String name,
            String roadAddress,
            Long venueId
    );

    List<Venue> findAllByStatus(VenueStatus status);

    Optional<Venue> findByIdAndStatus(
            Long venueId,
            VenueStatus status
    );
}
