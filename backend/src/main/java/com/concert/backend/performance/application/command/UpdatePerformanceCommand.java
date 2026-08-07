package com.concert.backend.performance.application.command;

import java.time.LocalDateTime;

public record UpdatePerformanceCommand(
        Long venueHallId,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        LocalDateTime reservationOpensAt,
        LocalDateTime reservationClosesAt,
        Integer maxTicketsPerMember
) {
}
