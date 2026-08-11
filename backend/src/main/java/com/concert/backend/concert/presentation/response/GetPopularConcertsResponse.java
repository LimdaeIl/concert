package com.concert.backend.concert.presentation.response;

import com.concert.backend.concert.application.result.PopularConcertResult;
import java.util.List;

public record GetPopularConcertsResponse(
        List<PopularConcertResponse> concerts
) {

    public static GetPopularConcertsResponse from(
            List<PopularConcertResult> results
    ) {
        return new GetPopularConcertsResponse(
                results.stream()
                        .map(
                                PopularConcertResponse::from
                        )
                        .toList()
        );
    }
}