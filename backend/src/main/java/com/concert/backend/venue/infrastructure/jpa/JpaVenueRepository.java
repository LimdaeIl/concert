package com.concert.backend.venue.infrastructure.jpa;

import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaVenueRepository extends JpaRepository<Venue, Long> {

    boolean existsByNameAndAddress_RoadAddress(String name, String roadAddress);

    boolean existsByNameAndAddress_RoadAddressAndIdNot(String name, String roadAddress, Long venueId);

    List<Venue> findAllByStatus(VenueStatus status);

    Optional<Venue> findByIdAndStatus(
            Long venueId,
            VenueStatus status
    );
}
