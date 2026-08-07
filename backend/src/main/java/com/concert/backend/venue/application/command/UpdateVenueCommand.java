package com.concert.backend.venue.application.command;

import java.math.BigDecimal;

public record UpdateVenueCommand(
        String name,
        String phone,
        String roadAddress,
        String jibunAddress,
        String detailAddress,
        String zipCode,
        BigDecimal latitude,
        BigDecimal longitude
) {
}
