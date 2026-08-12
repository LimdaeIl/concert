package com.concert.backend.performance.query;

import com.concert.backend.performance.domain.PerformanceStatus;
import java.time.LocalDateTime;

public record AdminPerformanceQueryRow(

        Long performanceId,
        Long concertId,
        Long venueHallId,

        String venueName,
        String venueHallName,

        LocalDateTime startsAt,
        LocalDateTime endsAt,

        LocalDateTime reservationOpensAt,
        LocalDateTime reservationClosesAt,

        Integer maxTicketsPerMember,

        PerformanceStatus status,

        long performanceSeatCount
) {
}
