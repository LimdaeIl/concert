package com.concert.backend.auth.presentation.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record SignInResponse(

        @Schema(
                description = "회원 ID",
                example = "3"
        )
        Long id,

        @Schema(
                description = "API 요청에 사용할 Access Token"
        )
        String accessToken
        
) {

    public static SignInResponse of(Long id, String accessToken) {
        return new SignInResponse(id, accessToken);
    }
}

