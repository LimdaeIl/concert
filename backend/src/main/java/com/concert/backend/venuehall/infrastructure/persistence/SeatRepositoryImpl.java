package com.concert.backend.venuehall.infrastructure.persistence;

import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import com.concert.backend.venuehall.infrastructure.jpa.JpaSeatRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class SeatRepositoryImpl implements SeatRepository {

    private final JpaSeatRepository jpaSeatRepository;

    @Override
    public Seat save(Seat seat) {
        return jpaSeatRepository.save(seat);
    }

    @Override
    public List<Seat> saveAll(List<Seat> seats) {
        return jpaSeatRepository.saveAll(seats);
    }

    @Override
    public Optional<Seat> findById(Long seatId) {
        return jpaSeatRepository.findById(seatId);
    }

    @Override
    public Optional<Seat> findByIdAndStatus(
            Long seatId,
            SeatStatus status
    ) {
        return jpaSeatRepository.findByIdAndStatus(
                seatId,
                status
        );
    }

    @Override
    public List<Seat> findAllByVenueHallIdAndStatus(
            Long venueHallId,
            SeatStatus status
    ) {
        return jpaSeatRepository
                .findAllByVenueHall_IdAndStatus(
                        venueHallId,
                        status
                );
    }

    @Override
    public long countByVenueHallId(Long venueHallId) {
        return jpaSeatRepository.countByVenueHall_Id(
                venueHallId
        );
    }

    @Override
    public boolean existsByPosition(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber
    ) {
        return jpaSeatRepository
                .existsByVenueHall_IdAndSectionNameAndFloorAndRowNameAndSeatNumber(
                        venueHallId,
                        sectionName,
                        floor,
                        rowName,
                        seatNumber
                );
    }

    @Override
    public boolean existsByPositionAndIdNot(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            Long seatId
    ) {
        return jpaSeatRepository
                .existsByVenueHall_IdAndSectionNameAndFloorAndRowNameAndSeatNumberAndIdNot(
                        venueHallId,
                        sectionName,
                        floor,
                        rowName,
                        seatNumber,
                        seatId
                );
    }

    @Override
    public List<Seat> findAllById(List<Long> seatIds) {
        return jpaSeatRepository.findAllById(seatIds);
    }

    @Override
    public List<Seat> findAllByIdForUpdate(Collection<Long> seatIds) {
        return jpaSeatRepository.findAllByIdForUpdate(seatIds);
    }

    @Override
    public void deleteAll(Collection<Seat> seats) {
        jpaSeatRepository.deleteAll(seats);
    }

    @Override
    public List<Seat> findAllForAdminSeatMap(
            Long venueHallId,
            String keyword,
            Short floor,
            SeatType seatType,
            SeatStatus status
    ) {
        return jpaSeatRepository
                .findAllForAdminSeatMap(
                        venueHallId,
                        keyword,
                        floor,
                        seatType,
                        status
                );
    }

}
