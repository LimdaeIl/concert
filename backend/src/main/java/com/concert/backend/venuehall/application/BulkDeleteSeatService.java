package com.concert.backend.venuehall.application;

import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
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
public class BulkDeleteSeatService {

    private final VenueHallRepository venueHallRepository;
    private final SeatRepository seatRepository;
    private final PerformanceSeatRepository performanceSeatRepository;

    @Transactional
    public void delete(
            Long venueHallId,
            List<Long> seatIds
    ) {
        validateVenueHallExists(
                venueHallId
        );

        validateDuplicateIds(
                seatIds
        );

        List<Seat> seats =
                seatRepository
                        .findAllByIdForUpdate(
                                seatIds
                        );

        validateAllSeatsExist(
                seatIds,
                seats
        );

        validateBelongToVenueHall(
                venueHallId,
                seats
        );

        validateNotUsedByPerformance(
                seatIds
        );

        seatRepository.deleteAll(
                seats
        );
    }

    private void validateVenueHallExists(
            Long venueHallId
    ) {
        venueHallRepository
                .findById(
                        venueHallId
                )
                .orElseThrow(() ->
                        new VenueHallException(
                                VenueHallErrorCode
                                        .VENUE_HALL_NOT_FOUND
                        )
                );
    }

    private void validateDuplicateIds(
            List<Long> seatIds
    ) {
        Set<Long> uniqueIds =
                new HashSet<>(
                        seatIds
                );

        if (
                uniqueIds.size()
                        != seatIds.size()
        ) {
            throw new SeatException(
                    SeatErrorCode
                            .DUPLICATE_SEAT_ID
            );
        }
    }

    private void validateAllSeatsExist(
            List<Long> requestedIds,
            List<Seat> seats
    ) {
        if (
                requestedIds.size()
                        != seats.size()
        ) {
            throw new SeatException(
                    SeatErrorCode
                            .SEAT_NOT_FOUND
            );
        }
    }

    private void validateBelongToVenueHall(
            Long venueHallId,
            List<Seat> seats
    ) {
        boolean containsAnotherVenueHall =
                seats.stream()
                        .anyMatch(
                                seat ->
                                        !seat
                                                .getVenueHall()
                                                .getId()
                                                .equals(
                                                        venueHallId
                                                )
                        );

        if (
                containsAnotherVenueHall
        ) {
            /*
             * URL의 공연홀 소속이 아닌 좌석은
             * 해당 공연홀 기준으로 존재하지 않는 것으로 처리한다.
             */
            throw new SeatException(
                    SeatErrorCode
                            .SEAT_NOT_FOUND
            );
        }
    }

    private void validateNotUsedByPerformance(
            List<Long> seatIds
    ) {
        if (
                performanceSeatRepository
                        .existsBySeatIdIn(
                                seatIds
                        )
        ) {
            throw new SeatException(
                    SeatErrorCode
                            .SEAT_IN_USE_BY_PERFORMANCE
            );
        }
    }
}
