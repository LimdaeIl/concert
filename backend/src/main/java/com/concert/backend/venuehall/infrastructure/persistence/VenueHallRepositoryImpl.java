package com.concert.backend.venuehall.infrastructure.persistence;

import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import com.concert.backend.venuehall.infrastructure.jpa.JpaVenueHallRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class VenueHallRepositoryImpl
        implements VenueHallRepository {

    private final JpaVenueHallRepository jpaVenueHallRepository;

    @Override
    public VenueHall save(VenueHall venueHall) {
        return jpaVenueHallRepository.save(venueHall);
    }

    @Override
    public Optional<VenueHall> findById(
            Long venueHallId
    ) {
        return jpaVenueHallRepository.findById(venueHallId);
    }

    @Override
    public Optional<VenueHall> findByIdAndStatus(
            Long venueHallId,
            VenueHallStatus status
    ) {
        return jpaVenueHallRepository.findByIdAndStatus(
                venueHallId,
                status
        );
    }

    @Override
    public List<VenueHall> findAllByVenueIdAndStatus(
            Long venueId,
            VenueHallStatus status
    ) {
        return jpaVenueHallRepository
                .findAllByVenueIdAndStatus(
                        venueId,
                        status
                );
    }

    @Override
    public boolean existsByVenueIdAndName(
            Long venueId,
            String name
    ) {
        return jpaVenueHallRepository
                .existsByVenueIdAndName(
                        venueId,
                        name
                );
    }

    @Override
    public boolean existsByVenueIdAndNameAndIdNot(
            Long venueId,
            String name,
            Long venueHallId
    ) {
        return jpaVenueHallRepository
                .existsByVenueIdAndNameAndIdNot(
                        venueId,
                        name,
                        venueHallId
                );
    }
}
