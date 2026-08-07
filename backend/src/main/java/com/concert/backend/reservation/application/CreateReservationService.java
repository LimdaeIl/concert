package com.concert.backend.reservation.application;

import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.reservation.application.command.CreateReservationCommand;
import com.concert.backend.reservation.application.result.ReservationResult;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationNumberGenerator;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.domain.ReservationSeat;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import com.concert.backend.reservation.infrastructure.ReservationProperties;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CreateReservationService {

    private final PerformanceRepository performanceRepository;
    private final PerformanceSeatRepository performanceSeatRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationNumberGenerator
            reservationNumberGenerator;
    private final ReservationProperties properties;
    private final Clock clock;

    @Transactional
    public ReservationResult create(
            Long memberId,
            Long performanceId,
            CreateReservationCommand command
    ) {
        Performance performance =
                performanceRepository
                        .findById(performanceId)
                        .orElseThrow(() ->
                                new PerformanceException(
                                        PerformanceErrorCode.PERFORMANCE_NOT_FOUND
                                )
                        );

        LocalDateTime now =
                LocalDateTime.now(clock);

        validatePerformanceReservable(
                performance,
                now
        );

        validateRequestedSeatCount(
                memberId,
                performance,
                command.performanceSeatIds()
        );

        validateDuplicateIds(
                command.performanceSeatIds()
        );

        List<PerformanceSeat> performanceSeats =
                performanceSeatRepository
                        .findAllById(
                                command.performanceSeatIds()
                        );

        if (performanceSeats.size()
                != command.performanceSeatIds().size()) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_SEAT_REQUIRED
            );
        }

        validatePerformanceSeats(
                performanceId,
                performanceSeats
        );

        LocalDateTime expiresAt = now.plus(
                properties.paymentTimeout()
        );

        /*
         * 예매 종료 이후까지 결제를 허용하면 안 된다.
         */
        if (expiresAt.isAfter(
                performance.getReservationClosesAt()
        )) {
            expiresAt =
                    performance.getReservationClosesAt();
        }

        Reservation reservation =
                Reservation.create(
                        reservationNumberGenerator.generate(),
                        memberId,
                        performanceId,
                        expiresAt
                );

        for (PerformanceSeat performanceSeat
                : performanceSeats) {

            performanceSeat.hold(
                    memberId,
                    expiresAt
            );

            ReservationSeat reservationSeat =
                    ReservationSeat.create(
                            reservation,
                            performanceSeat
                    );

            reservation.addSeat(
                    reservationSeat
            );
        }

        Reservation savedReservation =
                reservationRepository.save(
                        reservation
                );

        return ReservationResult.from(
                savedReservation
        );
    }

    private void validatePerformanceReservable(
            Performance performance,
            LocalDateTime now
    ) {
        if (performance.getStatus()
                != PerformanceStatus.OPEN) {
            throw new ReservationException(
                    ReservationErrorCode
                            .PERFORMANCE_NOT_RESERVABLE
            );
        }

        if (now.isBefore(
                performance.getReservationOpensAt()
        )
                || !now.isBefore(
                performance.getReservationClosesAt()
        )) {
            throw new ReservationException(
                    ReservationErrorCode
                            .PERFORMANCE_NOT_RESERVABLE
            );
        }
    }

    private void validateRequestedSeatCount(
            Long memberId,
            Performance performance,
            List<Long> requestedSeatIds
    ) {
        if (requestedSeatIds == null
                || requestedSeatIds.isEmpty()) {
            throw new ReservationException(
                    ReservationErrorCode
                            .RESERVATION_SEAT_REQUIRED
            );
        }

        long existingSeatCount =
                reservationRepository
                        .countReservationSeatsByMemberIdAndPerformanceId(
                                memberId,
                                performance.getId()
                        );

        long total =
                existingSeatCount
                        + requestedSeatIds.size();

        if (total
                > performance
                .getMaxTicketsPerMember()) {
            throw new ReservationException(
                    ReservationErrorCode
                            .TOO_MANY_RESERVATION_SEATS
            );
        }
    }

    private void validateDuplicateIds(
            List<Long> ids
    ) {
        Set<Long> unique =
                new HashSet<>(ids);

        if (unique.size() != ids.size()) {
            throw new ReservationException(
                    ReservationErrorCode
                            .DUPLICATE_RESERVATION_SEAT
            );
        }
    }

    private void validatePerformanceSeats(
            Long performanceId,
            List<PerformanceSeat> seats
    ) {
        for (PerformanceSeat seat : seats) {
            if (!seat.getPerformance()
                    .getId()
                    .equals(performanceId)) {
                throw new ReservationException(
                        ReservationErrorCode
                                .PERFORMANCE_SEAT_MISMATCH
                );
            }

            if (!seat.isAvailable()) {
                throw new ReservationException(
                        ReservationErrorCode
                                .SEAT_NOT_RESERVABLE
                );
            }
        }
    }
}
