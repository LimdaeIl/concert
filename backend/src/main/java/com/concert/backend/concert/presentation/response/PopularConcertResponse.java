package com.concert.backend.concert.presentation.response;

import com.concert.backend.concert.application.result.PopularConcertResult;

public record PopularConcertResponse(
        Long concertId,
        String title,
        String subtitle,
        String category,
        String ageRating,
        String posterUrl,
        Long completedReservationSeatCount,
        int rank
) {

    public static PopularConcertResponse from(
            PopularConcertResult result
    ) {
        return new PopularConcertResponse(
                result.concertId(),
                result.title(),
                result.subtitle(),
                result.category().name(),
                result.ageRating().name(),
                result.posterUrl(),
                result.completedReservationSeatCount(),
                result.rank()
        );
    }
}
