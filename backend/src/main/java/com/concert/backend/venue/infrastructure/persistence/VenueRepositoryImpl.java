package com.concert.backend.venue.infrastructure.persistence;

import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.domain.VenueStatus;
import com.concert.backend.venue.infrastructure.jpa.JpaVenueRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class VenueRepositoryImpl
        implements VenueRepository {

    private final JpaVenueRepository jpaVenueRepository;

    @Override
    public Venue save(Venue venue) {
        return jpaVenueRepository.save(venue);
    }

    @Override
    public Optional<Venue> findById(Long venueId) {
        return jpaVenueRepository.findById(venueId);
    }

    @Override
    public List<Venue> findAll() {
        return jpaVenueRepository.findAll();
    }

    @Override
    public boolean existsByNameAndRoadAddress(
            String name,
            String roadAddress
    ) {
        return jpaVenueRepository
                .existsByNameAndAddress_RoadAddress(
                        name,
                        roadAddress
                );
    }

    @Override
    public boolean existsByNameAndRoadAddressAndIdNot(
            String name,
            String roadAddress,
            Long venueId
    ) {
        return jpaVenueRepository
                .existsByNameAndAddress_RoadAddressAndIdNot(
                        name,
                        roadAddress,
                        venueId
                );
    }
    @Override
    public List<Venue> findAllByStatus(
            VenueStatus status
    ) {
        return jpaVenueRepository.findAllByStatus(status);
    }

    @Override
    public Optional<Venue> findByIdAndStatus(
            Long venueId,
            VenueStatus status
    ) {
        return jpaVenueRepository.findByIdAndStatus(
                venueId,
                status
        );
    }
}
