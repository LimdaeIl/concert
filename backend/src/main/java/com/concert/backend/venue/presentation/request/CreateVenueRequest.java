package com.concert.backend.venue.presentation.request;

import com.concert.backend.venue.application.command.CreateVenueCommand;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateVenueRequest(
        @Schema(
                description = "공연장 이름",
                example = "KSPO DOME"
        )
        @NotBlank(message = "이름은 필수 입력값입니다.")
        @Size(max = 100, message = "이름은 최대 100자까지 입력 가능합니다.")
        String name,

        @Pattern(regexp = "^01[016789]\\d{7,8}$", message = "올바른 휴대폰 번호 형식이 아닙니다. (예: 01012345678)")
        String phone,

        @Schema(
                description = "도로명 주소",
                example = "서울특별시 송파구 올림픽로 424"
        )
        @NotBlank(message = "도로명 주소는 필수 입력값입니다.")
        @Size(max = 255, message = "도로명 주소는 최대 255자까지 입력 가능합니다.")
        String roadAddress,

        @Size(max = 255, message = "지번 주소는 최대 255자까지 입력 가능합니다.")
        String jibunAddress,

        @Size(max = 255, message = "상세 주소는 최대 255자까지 입력 가능합니다.")
        String detailAddress,

        @Size(max = 10, message = "우편번호는 최대 10자까지 입력 가능합니다.")
        String zipCode,

        @DecimalMin(value = "-90.0", message = "위도는 -90.0 이상이어야 합니다.")
        @DecimalMax(value = "90.0", message = "위도는 90.0 이하이어야 합니다.")
        BigDecimal latitude,

        @DecimalMin(value = "-180.0", message = "경도는 -180.0 이상이어야 합니다.")
        @DecimalMax(value = "180.0", message = "경도는 180.0 이하이어야 합니다.")
        BigDecimal longitude
) {

    public CreateVenueCommand toCommand() {
        return new CreateVenueCommand(
                name,
                phone,
                roadAddress,
                jibunAddress,
                detailAddress,
                zipCode,
                latitude,
                longitude
        );
    }
}
