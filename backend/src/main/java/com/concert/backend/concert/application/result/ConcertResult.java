package com.concert.backend.concert.application.result;

import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.domain.ConcertStatus;

public record ConcertResult(
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

    public static ConcertResult from(
            Concert concert,
            String posterUrl
    ) {
        return new ConcertResult(
                concert.getId(),
                concert.getTitle(),
                concert.getSubtitle(),
                concert.getDescription(),
                concert.getCategory(),
                concert.getRunningTime(),
                concert.getAgeRating(),
                posterUrl,
                concert.getStatus()
        );
    }
}
