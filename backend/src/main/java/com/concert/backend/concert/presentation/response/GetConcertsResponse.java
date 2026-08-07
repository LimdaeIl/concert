package com.concert.backend.concert.presentation.response;

import com.concert.backend.concert.application.result.ConcertResult;
import java.util.List;

public record GetConcertsResponse(
        List<ConcertResponse> concerts
) {

    public static GetConcertsResponse from(
            List<ConcertResult> results
    ) {
        return new GetConcertsResponse(
                results.stream()
                        .map(ConcertResponse::from)
                        .toList()
        );
    }
}
