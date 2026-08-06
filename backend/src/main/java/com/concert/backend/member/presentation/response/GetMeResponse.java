package com.concert.backend.member.presentation.response;

import com.concert.backend.common.domain.Address;
import com.concert.backend.member.application.result.GetMeResult;
import java.math.BigDecimal;
import java.util.List;

public record GetMeResponse(
        Long memberId,
        String email,
        String name,
        String phone,
        String role,
        String status,
        AddressResponse address,
        List<String> socialProviders
) {

    public static GetMeResponse from(GetMeResult result) {
        return new GetMeResponse(
                result.memberId(),
                result.email(),
                result.name(),
                result.phone(),
                result.role().name(),
                result.status().name(),
                AddressResponse.from(result.address()),
                result.socialProviders()
                        .stream()
                        .map(Enum::name)
                        .toList()
        );
    }

    public record AddressResponse(
            String roadAddress,
            String jibunAddress,
            String detailAddress,
            String zipCode,
            BigDecimal latitude,
            BigDecimal longitude
    ) {

        public static AddressResponse from(Address address) {
            return new AddressResponse(
                    address.getRoadAddress(),
                    address.getJibunAddress(),
                    address.getDetailAddress(),
                    address.getZipCode(),
                    address.getLatitude(),
                    address.getLongitude()
            );
        }
    }
}
