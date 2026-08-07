package com.concert.backend.venuehall.domain;

import java.util.List;
import java.util.Optional;

public interface VenueHallRepository {

    VenueHall save(VenueHall venueHall);

    Optional<VenueHall> findById(Long venueHallId);

    Optional<VenueHall> findByIdAndStatus(
            Long venueHallId,
            VenueHallStatus status
    );

    List<VenueHall> findAllByVenueIdAndStatus(
            Long venueId,
            VenueHallStatus status
    );

    boolean existsByVenueIdAndName(
            Long venueId,
            String name
    );

    boolean existsByVenueIdAndNameAndIdNot(
            Long venueId,
            String name,
            Long venueHallId
    );
}
