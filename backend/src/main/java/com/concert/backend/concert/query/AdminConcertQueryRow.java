package com.concert.backend.concert.query;

import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.domain.ConcertStatus;

public record AdminConcertQueryRow(
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
}
