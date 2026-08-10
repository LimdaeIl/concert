package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import com.concert.backend.venuehall.exception.SeatErrorCode;
import com.concert.backend.venuehall.exception.SeatException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class BulkUpdateSeatService {

    private final SeatRepository seatRepository;

    @Transactional
    public List<SeatResult> update(
            Long venueHallId,
            List<Long> seatIds,
            SeatType seatType,
            SeatStatus status
    ) {
        validateRequest(
                seatIds,
                seatType,
                status
        );

        /*
         * 같은 seatId가 여러 번 전달되더라도
         * 실제 수정은 한 번만 수행한다.
         */
        Set<Long> uniqueSeatIds =
                new LinkedHashSet<>(
                        seatIds
                );

        List<Seat> seats =
                seatRepository.findAllById(
                        List.copyOf(uniqueSeatIds)
                );

        if (seats.size()
                != uniqueSeatIds.size()) {

            throw new SeatException(
                    SeatErrorCode.SEAT_NOT_FOUND
            );
        }

        validateVenueHall(
                venueHallId,
                seats
        );

        for (Seat seat : seats) {

            if (seatType != null
                    && seat.getSeatType() != seatType) {

                /*
                 * 위치는 유지하고
                 * seatType만 변경한다.
                 */
                seat.update(
                        seat.getSectionName(),
                        seat.getFloor(),
                        seat.getRowName(),
                        seat.getSeatNumber(),
                        seatType
                );
            }

            if (status != null
                    && seat.getStatus() != status) {

                seat.changeStatus(
                        status
                );
            }
        }

        List<Seat> savedSeats =
                seatRepository.saveAll(
                        seats
                );

        return savedSeats.stream()
                .map(SeatResult::from)
                .toList();
    }

    private void validateRequest(
            List<Long> seatIds,
            SeatType seatType,
            SeatStatus status
    ) {
        if (seatIds == null
                || seatIds.isEmpty()) {

            throw new IllegalArgumentException(
                    "수정할 좌석이 필요합니다."
            );
        }

        if (seatType == null
                && status == null) {

            throw new IllegalArgumentException(
                    "변경할 좌석 유형 또는 상태가 필요합니다."
            );
        }
    }

    private void validateVenueHall(
            Long venueHallId,
            List<Seat> seats
    ) {
        boolean hasDifferentVenueHall =
                seats.stream()
                        .anyMatch(
                                seat ->
                                        !seat.getVenueHall()
                                                .getId()
                                                .equals(
                                                        venueHallId
                                                )
                        );

        if (hasDifferentVenueHall) {
            throw new IllegalArgumentException(
                    "다른 공연홀의 좌석이 포함되어 있습니다."
            );
        }
    }
}
