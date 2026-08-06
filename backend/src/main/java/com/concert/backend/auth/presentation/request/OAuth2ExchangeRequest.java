package com.concert.backend.auth.presentation.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record OAuth2ExchangeRequest(

        @Schema(
                description = "OAuth 로그인 완료 후 발급된 일회용 교환 코드",
                example = "kS5L4J5Ds..."
        )
        @NotBlank(message = "소셜 로그인 교환 코드는 필수입니다.")
        String code
) {
}
