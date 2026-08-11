package com.concert.backend.concert.query;

import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.ConcertCategory;

public record PopularConcertQueryRow(
        Long concertId,
        String title,
        String subtitle,
        ConcertCategory category,
        AgeRating ageRating,
        String posterUrl,
        Long completedReservationSeatCount
) {
}
