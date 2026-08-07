package com.concert.backend.reservation.application;

import com.concert.backend.reservation.application.result.ReservationResult;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetReservationService {

    private final ReservationRepository
            reservationRepository;

    @Transactional(readOnly = true)
    public ReservationResult getReservation(
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

        return ReservationResult.from(
                reservation
        );
    }
}
