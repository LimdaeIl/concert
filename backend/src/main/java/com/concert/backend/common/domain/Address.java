package com.concert.backend.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Address {

    private static final String WITHDRAWN_ROAD_ADDRESS = "WITHDRAWN";

    @Column(name = "road_address", nullable = false, length = 255)
    private String roadAddress;

    @Column(name = "jibun_address", length = 255)
    private String jibunAddress;

    @Column(name = "detail_address", length = 255)
    private String detailAddress;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    private Address(
            String roadAddress,
            String jibunAddress,
            String detailAddress,
            String zipCode,
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        this.roadAddress = Objects.requireNonNull(roadAddress);
        this.jibunAddress = jibunAddress;
        this.detailAddress = detailAddress;
        this.zipCode = zipCode;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public static Address of(
            String roadAddress,
            String jibunAddress,
            String detailAddress,
            String zipCode,
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        return new Address(
                roadAddress,
                jibunAddress,
                detailAddress,
                zipCode,
                latitude,
                longitude
        );
    }

    public static Address anonymized() {
        return new Address(
                WITHDRAWN_ROAD_ADDRESS,
                null,
                null,
                null,
                null,
                null
        );
    }
}
