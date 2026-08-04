package com.concert.backend.auth.presentation.response;

public record SignInResponse(
        Long id,
        String accessToken
) {

    public static SignInResponse of(Long id, String accessToken) {
        return new SignInResponse(id, accessToken);
    }
}

