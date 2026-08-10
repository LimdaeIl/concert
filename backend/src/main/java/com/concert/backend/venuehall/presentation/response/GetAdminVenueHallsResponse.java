package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.AdminVenueHallPageResult;
import java.util.List;

public record GetAdminVenueHallsResponse(
        List<AdminVenueHallResponse> halls,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static GetAdminVenueHallsResponse from(
            AdminVenueHallPageResult result
    ) {
        List<AdminVenueHallResponse> halls =
                result.halls()
                        .stream()
                        .map(
                                AdminVenueHallResponse::from
                        )
                        .toList();

        return new GetAdminVenueHallsResponse(
                halls,
                result.page(),
                result.size(),
                result.totalElements(),
                result.totalPages(),
                result.first(),
                result.last()
        );
    }
}
