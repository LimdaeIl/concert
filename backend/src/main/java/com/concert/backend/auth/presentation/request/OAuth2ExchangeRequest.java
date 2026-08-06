package com.concert.backend.auth.presentation.request;

import jakarta.validation.constraints.NotBlank;

public record OAuth2ExchangeRequest(

        @NotBlank(message = "소셜 로그인 교환 코드는 필수입니다.")
        String code
) {
}
