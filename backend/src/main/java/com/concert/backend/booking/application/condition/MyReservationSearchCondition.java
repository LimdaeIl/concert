package com.concert.backend.booking.application.condition;

import com.concert.backend.reservation.domain.ReservationStatus;
import java.time.LocalDate;

public record MyReservationSearchCondition(
        Long memberId,
        ReservationStatus status,
        ConcertProgress concertProgress,
        String keyword,
        LocalDate from,
        LocalDate to,
        ReservationSortType sort,
        long offset,
        int size
) {
}
