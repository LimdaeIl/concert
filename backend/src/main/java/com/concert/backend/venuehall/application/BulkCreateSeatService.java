package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.command.CreateSeatCommand;
import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.exception.SeatErrorCode;
import com.concert.backend.venuehall.exception.SeatException;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class BulkCreateSeatService {

    private final VenueHallRepository venueHallRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public List<SeatResult> create(
            Long venueHallId,
            List<CreateSeatCommand> commands
    ) {
        VenueHall venueHall = venueHallRepository
                .findById(venueHallId)
                .orElseThrow(() ->
                        new VenueHallException(
                                VenueHallErrorCode.VENUE_HALL_NOT_FOUND
                        )
                );

        if (!venueHall.isActive()) {
            throw new SeatException(
                    SeatErrorCode.VENUE_HALL_NOT_AVAILABLE_FOR_SEAT
            );
        }

        validateCapacity(
                venueHall,
                commands.size()
        );

        validateDuplicates(
                venueHallId,
                commands
        );

        List<Seat> seats = commands.stream()
                .map(command ->
                        Seat.create(
                                venueHall,
                                command.sectionName(),
                                command.floor(),
                                command.rowName(),
                                command.seatNumber(),
                                command.seatType()
                        )
                )
                .toList();

        List<Seat> savedSeats =
                seatRepository.saveAll(seats);

        return savedSeats.stream()
                .map(SeatResult::from)
                .toList();
    }

    private void validateCapacity(
            VenueHall venueHall,
            int newSeatCount
    ) {
        long currentSeatCount =
                seatRepository.countByVenueHallId(
                        venueHall.getId()
                );

        if (currentSeatCount + newSeatCount
                > venueHall.getCapacity()) {
            throw new SeatException(
                    SeatErrorCode.VENUE_HALL_CAPACITY_EXCEEDED
            );
        }
    }

    private void validateDuplicates(
            Long venueHallId,
            List<CreateSeatCommand> commands
    ) {
        Set<String> requestedPositions =
                new HashSet<>();

        for (CreateSeatCommand command : commands) {
            String positionKey = String.join(
                    "|",
                    command.sectionName(),
                    command.floor().toString(),
                    command.rowName(),
                    command.seatNumber()
            );

            if (!requestedPositions.add(positionKey)) {
                throw new SeatException(
                        SeatErrorCode.DUPLICATE_SEAT_POSITION
                );
            }

            if (seatRepository.existsByPosition(
                    venueHallId,
                    command.sectionName(),
                    command.floor(),
                    command.rowName(),
                    command.seatNumber()
            )) {
                throw new SeatException(
                        SeatErrorCode.DUPLICATE_SEAT_POSITION
                );
            }
        }
    }
}

