package com.concert.backend.venue.presentation.response;

import com.concert.backend.venue.application.result.CreateVenueResult;
import java.math.BigDecimal;

public record CreateVenueResponse(
        Long venueId,
        String name,
        String phone,
        String status,
        String roadAddress,
        String jibunAddress,
        String detailAddress,
        String zipCode,
        BigDecimal latitude,
        BigDecimal longitude
) {

    public static CreateVenueResponse from(
            CreateVenueResult result
    ) {
        return new CreateVenueResponse(
                result.venueId(),
                result.name(),
                result.phone(),
                result.status().name(),
                result.roadAddress(),
                result.jibunAddress(),
                result.detailAddress(),
                result.zipCode(),
                result.latitude(),
                result.longitude()
        );
    }
}
