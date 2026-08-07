package com.concert.backend.performance.presentation.request;

import com.concert.backend.performance.application.command.CreatePerformanceCommand;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreatePerformanceRequest(

        @NotNull
        Long venueHallId,

        @NotNull
        LocalDateTime startsAt,

        @NotNull
        LocalDateTime endsAt,

        @NotNull
        LocalDateTime reservationOpensAt,

        @NotNull
        LocalDateTime reservationClosesAt,

        @NotNull
        @Min(1)
        Integer maxTicketsPerMember
) {

    public CreatePerformanceCommand toCommand() {
        return new CreatePerformanceCommand(
                venueHallId,
                startsAt,
                endsAt,
                reservationOpensAt,
                reservationClosesAt,
                maxTicketsPerMember
        );
    }
}
