package com.concert.backend.reservation.application;

import com.concert.backend.reservation.application.result.ReservationResult;
import com.concert.backend.reservation.domain.ReservationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetMyReservationsService {

    private final ReservationRepository
            reservationRepository;

    @Transactional(readOnly = true)
    public List<ReservationResult> getReservations(
            Long memberId
    ) {
        return reservationRepository
                .findAllByMemberId(memberId)
                .stream()
                .map(ReservationResult::from)
                .toList();
    }
}
