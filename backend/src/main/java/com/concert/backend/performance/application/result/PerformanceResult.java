package com.concert.backend.performance.application.result;

import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceStatus;
import java.time.LocalDateTime;

public record PerformanceResult(
        Long performanceId,
        Long concertId,
        Long venueHallId,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        LocalDateTime reservationOpensAt,
        LocalDateTime reservationClosesAt,
        Integer maxTicketsPerMember,
        PerformanceStatus status
) {

    public static PerformanceResult from(
            Performance performance
    ) {
        return new PerformanceResult(
                performance.getId(),
                performance.getConcertId(),
                performance.getVenueHallId(),
                performance.getStartsAt(),
                performance.getEndsAt(),
                performance.getReservationOpensAt(),
                performance.getReservationClosesAt(),
                performance.getMaxTicketsPerMember(),
                performance.getStatus()
        );
    }
}
