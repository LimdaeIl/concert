package com.concert.backend.reservation.application;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.domain.ReservationSeat;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ExpireReservationService {

    private final ReservationRepository
            reservationRepository;

    private final PerformanceSeatRepository
            performanceSeatRepository;

    private final Clock clock;

    @Transactional
    public int expire(int batchSize) {
        LocalDateTime now =
                LocalDateTime.now(clock);

        List<Reservation> reservations =
                reservationRepository
                        .findExpiredPendingReservations(
                                now,
                                batchSize
                        );

        for (Reservation reservation
                : reservations) {

            expireReservation(
                    reservation,
                    now
            );
        }

        return reservations.size();
    }

    private void expireReservation(
            Reservation reservation,
            LocalDateTime now
    ) {
        if (!reservation.isExpired(now)) {
            return;
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

        for (PerformanceSeat seat : seats) {
            seat.releaseExpired(
                    reservation.getMemberId(),
                    now
            );
        }

        reservation.expire(now);
    }
}
