package com.concert.backend.venue.application.result;

import com.concert.backend.common.domain.Address;
import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueStatus;
import java.math.BigDecimal;

public record CreateVenueResult(
        Long venueId,
        String name,
        String phone,
        VenueStatus status,
        String roadAddress,
        String jibunAddress,
        String detailAddress,
        String zipCode,
        BigDecimal latitude,
        BigDecimal longitude
) {

    public static CreateVenueResult from(Venue venue) {
        Address address = venue.getAddress();

        return new CreateVenueResult(
                venue.getId(),
                venue.getName(),
                venue.getPhone(),
                venue.getStatus(),
                address.getRoadAddress(),
                address.getJibunAddress(),
                address.getDetailAddress(),
                address.getZipCode(),
                address.getLatitude(),
                address.getLongitude()
        );
    }
}
