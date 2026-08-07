package com.concert.backend.concert.presentation.response;

import com.concert.backend.concert.application.result.ConcertResult;

public record ConcertResponse(
        Long concertId,
        String title,
        String subtitle,
        String description,
        String category,
        Integer runningTime,
        String ageRating,
        String posterUrl,
        String status
) {

    public static ConcertResponse from(
            ConcertResult result
    ) {
        return new ConcertResponse(
                result.concertId(),
                result.title(),
                result.subtitle(),
                result.description(),
                result.category().name(),
                result.runningTime(),
                result.ageRating().name(),
                result.posterUrl(),
                result.status().name()
        );
    }
}
