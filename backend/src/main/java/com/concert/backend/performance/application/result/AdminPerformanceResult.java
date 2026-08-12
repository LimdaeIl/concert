package com.concert.backend.performance.application.result;

import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.query.AdminPerformanceQueryRow;
import java.time.LocalDateTime;

public record AdminPerformanceResult(

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

    public static AdminPerformanceResult from(
            AdminPerformanceQueryRow row
    ) {
        return new AdminPerformanceResult(
                row.performanceId(),
                row.concertId(),
                row.venueHallId(),

                row.venueName(),
                row.venueHallName(),

                row.startsAt(),
                row.endsAt(),

                row.reservationOpensAt(),
                row.reservationClosesAt(),

                row.maxTicketsPerMember(),

                row.status(),

                row.performanceSeatCount()
        );
    }
}
