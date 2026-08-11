package com.concert.backend.reservation.application;

import com.concert.backend.concert.application.event.PopularConcertCacheEvictEvent;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CompleteReservationService {

    private final ReservationRepository
            reservationRepository;

    private final PerformanceSeatRepository
            performanceSeatRepository;

    private final ApplicationEventPublisher
            eventPublisher;

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
                                        ReservationErrorCode
                                                .RESERVATION_NOT_FOUND
                                )
                        );

        if (reservation.isExpired(completedAt)) {
            throw new ReservationException(
                    ReservationErrorCode
                            .RESERVATION_EXPIRED
            );
        }

        List<Long> performanceSeatIds =
                reservation
                        .getReservationSeats()
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
                    ReservationErrorCode
                            .RESERVATION_SEAT_REQUIRED
            );
        }

        for (PerformanceSeat seat : seats) {
            seat.reserve(
                    reservation.getMemberId(),
                    completedAt
            );
        }

        /*
         * PENDING_PAYMENT -> COMPLETED
         *
         * 이 시점부터 해당 예약 좌석이
         * 인기 공연 집계 대상에 포함된다.
         */
        reservation.complete(
                completedAt
        );

        /*
         * 인기 공연 캐시 무효화 이벤트 발행.
         *
         * 실제 Redis 삭제는
         * AFTER_COMMIT Listener에서 수행한다.
         */
        eventPublisher.publishEvent(
                new PopularConcertCacheEvictEvent()
        );
    }
}
