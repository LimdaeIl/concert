package com.concert.backend.reservation.query;

import com.concert.backend.reservation.domain.ReservationStatus;
import java.time.LocalDateTime;

public record AdminReservationSearchCondition(
        String keyword,
        ReservationStatus status,
        Long performanceId,
        LocalDateTime from,
        LocalDateTime to,
        AdminReservationSortType sort,
        int size,
        long offset
) {
}
