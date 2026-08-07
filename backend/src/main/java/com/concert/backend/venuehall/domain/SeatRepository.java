package com.concert.backend.venuehall.domain;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SeatRepository {

    Seat save(Seat seat);

    List<Seat> saveAll(List<Seat> seats);

    Optional<Seat> findById(Long seatId);

    Optional<Seat> findByIdAndStatus(
            Long seatId,
            SeatStatus status
    );

    List<Seat> findAllByVenueHallIdAndStatus(
            Long venueHallId,
            SeatStatus status
    );

    long countByVenueHallId(Long venueHallId);

    boolean existsByPosition(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber
    );

    boolean existsByPositionAndIdNot(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            Long seatId
    );

    List<Seat> findAllById(List<Long> seatIds);

}
