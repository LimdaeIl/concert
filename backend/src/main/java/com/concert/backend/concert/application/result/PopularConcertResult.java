package com.concert.backend.concert.application.result;

import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.query.PopularConcertQueryRow;
import java.io.Serializable;

public record PopularConcertResult(
        Long concertId,
        String title,
        String subtitle,
        ConcertCategory category,
        AgeRating ageRating,
        String posterUrl,
        Long completedReservationSeatCount,
        int rank
) implements Serializable {

    public static PopularConcertResult from(
            PopularConcertQueryRow row,
            String posterUrl,
            int rank
    ) {
        return new PopularConcertResult(
                row.concertId(),
                row.title(),
                row.subtitle(),
                row.category(),
                row.ageRating(),
                posterUrl,
                row.completedReservationSeatCount(),
                rank
        );
    }
}
