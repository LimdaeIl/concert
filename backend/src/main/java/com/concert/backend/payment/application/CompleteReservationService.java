package com.concert.backend.reservation.application;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.domain.ReservationSeat;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CompleteReservationService {

    private final ReservationRepository
            reservationRepository;

    private final PerformanceSeatRepository
            performanceSeatRepository;

    @Transactional
    public void complete(
            Long reservationId,
            LocalDateTime completedAt
    ) {
        Reservation reservation =
                reservationRepository
                        .findById(reservationId)
                        .orElseThrow(() ->
                                new ReservationException(
                                        ReservationErrorCode.RESERVATION_NOT_FOUND
                                )
                        );

        if (reservation.isExpired(completedAt)) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_EXPIRED
            );
        }

        List<Long> performanceSeatIds =
                reservation.getReservationSeats()
                        .stream()
                        .map(
                                ReservationSeat
                                        ::getPerformanceSeatId
                        )
                        .toList();

        List<PerformanceSeat> seats =
                performanceSeatRepository
                        .findAllById(
                                performanceSeatIds
                        );

        if (seats.size()
                != performanceSeatIds.size()) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_SEAT_REQUIRED
            );
        }

        for (PerformanceSeat seat : seats) {
            seat.reserve(
                    reservation.getMemberId(),
                    completedAt
            );
        }

        reservation.complete(completedAt);
    }
}
