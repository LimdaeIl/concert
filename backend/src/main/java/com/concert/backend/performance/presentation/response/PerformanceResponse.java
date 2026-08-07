package com.concert.backend.performance.presentation.response;

import com.concert.backend.performance.application.result.PerformanceResult;
import java.time.LocalDateTime;

public record PerformanceResponse(
        Long performanceId,
        Long concertId,
        Long venueHallId,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        LocalDateTime reservationOpensAt,
        LocalDateTime reservationClosesAt,
        Integer maxTicketsPerMember,
        String status
) {

    public static PerformanceResponse from(
            PerformanceResult result
    ) {
        return new PerformanceResponse(
                result.performanceId(),
                result.concertId(),
                result.venueHallId(),
                result.startsAt(),
                result.endsAt(),
                result.reservationOpensAt(),
                result.reservationClosesAt(),
                result.maxTicketsPerMember(),
                result.status().name()
        );
    }
}
