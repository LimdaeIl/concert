package com.concert.backend.reservation.application;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.reservation.application.result.ReservationResult;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.domain.ReservationSeat;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CancelReservationService {

    private final ReservationRepository
            reservationRepository;

    private final PerformanceSeatRepository
            performanceSeatRepository;

    private final Clock clock;

    @Transactional
    public ReservationResult cancel(
            Long memberId,
            Long reservationId
    ) {
        Reservation reservation =
                reservationRepository
                        .findByIdAndMemberId(
                                reservationId,
                                memberId
                        )
                        .orElseThrow(() ->
                                new ReservationException(
                                        ReservationErrorCode.RESERVATION_NOT_FOUND
                                )
                        );

        LocalDateTime now =
                LocalDateTime.now(clock);

        List<Long> performanceSeatIds =
                reservation.getReservationSeats()
                        .stream()
                        .map(
                                ReservationSeat::getPerformanceSeatId
                        )
                        .toList();

        List<PerformanceSeat> seats =
                performanceSeatRepository
                        .findAllById(
                                performanceSeatIds
                        );

        if (reservation.isPendingPayment()) {

            for (PerformanceSeat seat : seats) {
                seat.release(memberId);
            }

        } else if (reservation.isCompleted()) {

            for (PerformanceSeat seat : seats) {
                seat.cancelReservation();
            }

        } else {
            throw new ReservationException(
                    ReservationErrorCode
                            .INVALID_RESERVATION_STATUS
            );
        }

        reservation.cancel(now);

        return ReservationResult.from(
                reservation
        );
    }
}
