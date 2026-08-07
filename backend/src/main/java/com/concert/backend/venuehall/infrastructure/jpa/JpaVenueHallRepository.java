package com.concert.backend.venuehall.infrastructure.jpa;

import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaVenueHallRepository
        extends JpaRepository<VenueHall, Long> {

    Optional<VenueHall> findByIdAndStatus(
            Long id,
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
            Long id
    );
}
