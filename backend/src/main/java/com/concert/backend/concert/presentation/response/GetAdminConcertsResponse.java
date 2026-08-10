package com.concert.backend.concert.presentation.response;

import com.concert.backend.concert.application.result.AdminConcertPageResult;
import java.util.List;

public record GetAdminConcertsResponse(
        List<AdminConcertResponse> concerts,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static GetAdminConcertsResponse from(
            AdminConcertPageResult result
    ) {
        return new GetAdminConcertsResponse(
                result.concerts()
                        .stream()
                        .map(AdminConcertResponse::from)
                        .toList(),
                result.page(),
                result.size(),
                result.totalElements(),
                result.totalPages(),
                result.first(),
                result.last()
        );
    }
}
