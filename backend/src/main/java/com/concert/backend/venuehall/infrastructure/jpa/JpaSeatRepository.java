package com.concert.backend.venuehall.infrastructure.jpa;

import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaSeatRepository
        extends JpaRepository<Seat, Long> {

    Optional<Seat> findByIdAndStatus(
            Long id,
            SeatStatus status
    );

    List<Seat> findAllByVenueHall_IdAndStatus(
            Long venueHallId,
            SeatStatus status
    );

    long countByVenueHall_Id(Long venueHallId);

    boolean existsByVenueHall_IdAndSectionNameAndFloorAndRowNameAndSeatNumber(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber
    );

    boolean existsByVenueHall_IdAndSectionNameAndFloorAndRowNameAndSeatNumberAndIdNot(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            Long id
    );
}
