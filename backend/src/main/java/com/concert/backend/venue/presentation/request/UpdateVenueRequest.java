package com.concert.backend.venue.presentation.request;

import com.concert.backend.venue.application.command.UpdateVenueCommand;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateVenueRequest(
        @Schema(
                description = "공연장 전화번호",
                example = "024109111"
        )
        @NotBlank(message = "이름은 필수 입력값입니다.")
        @Size(
                max = 100,
                message = "이름은 최대 100자까지 입력 가능합니다."
        )
        String name,

        @NotBlank(message = "전화번호는 필수 입력값입니다.")
        @Size(
                max = 20,
                message = "전화번호는 최대 20자까지 입력 가능합니다."
        )
        String phone,

        @Schema(
                description = "도로명 주소",
                example = "서울특별시 송파구 올림픽로 424"
        )
        @NotBlank(message = "도로명 주소는 필수 입력값입니다.")
        @Size(max = 255)
        String roadAddress,

        @Size(max = 255)
        String jibunAddress,

        @Size(max = 255)
        String detailAddress,

        @Size(max = 10)
        String zipCode,

        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        BigDecimal latitude,

        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        BigDecimal longitude
) {

    public UpdateVenueCommand toCommand() {
        return new UpdateVenueCommand(
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
