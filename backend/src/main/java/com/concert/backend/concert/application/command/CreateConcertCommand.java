package com.concert.backend.concert.application.command;

import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.ConcertCategory;

public record CreateConcertCommand(
        String title,
        String subtitle,
        String description,
        ConcertCategory category,
        Integer runningTime,
        AgeRating ageRating
) {
}
