package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.AdminPerformanceResult;
import java.time.LocalDateTime;

public record AdminPerformanceResponse(

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

        String status,

        long performanceSeatCount
) {

    public static AdminPerformanceResponse from(
            AdminPerformanceResult result
    ) {
        return new AdminPerformanceResponse(
                result.performanceId(),
                result.concertId(),
                result.venueHallId(),

                result.venueName(),
                result.venueHallName(),

                result.startsAt(),
                result.endsAt(),

                result.reservationOpensAt(),
                result.reservationClosesAt(),

                result.maxTicketsPerMember(),

                result.status().name(),

                result.performanceSeatCount()
        );
    }
}
