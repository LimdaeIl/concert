package com.concert.backend.venuehall.presentation.response;

import com.concert.backend.venuehall.application.result.AdminSeatPageResult;
import java.util.List;

public record GetAdminSeatsResponse(
        List<AdminSeatResponse> seats,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static GetAdminSeatsResponse from(
            AdminSeatPageResult result
    ) {
        return new GetAdminSeatsResponse(
                result.seats()
                        .stream()
                        .map(
                                AdminSeatResponse::from
                        )
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
