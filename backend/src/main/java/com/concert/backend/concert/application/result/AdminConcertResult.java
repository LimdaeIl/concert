package com.concert.backend.concert.application.result;

import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.query.AdminConcertQueryRow;

public record AdminConcertResult(
        Long concertId,
        String title,
        String subtitle,
        String description,
        ConcertCategory category,
        Integer runningTime,
        AgeRating ageRating,
        String posterUrl,
        ConcertStatus status
) {

    public static AdminConcertResult from(
            AdminConcertQueryRow row
    ) {
        return new AdminConcertResult(
                row.concertId(),
                row.title(),
                row.subtitle(),
                row.description(),
                row.category(),
                row.runningTime(),
                row.ageRating(),
                row.posterUrl(),
                row.status()
        );
    }
}
