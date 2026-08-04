package com.concert.backend.auth.presentation.response;


import com.concert.backend.auth.application.result.VerifyEmailResult;

public record VerifyEmailResponse(
        String email,
        String verificationToken,
        long expiresInSeconds
) {

    public static VerifyEmailResponse from(
            VerifyEmailResult result
    ) {
        return new VerifyEmailResponse(
                result.email(),
                result.verificationToken(),
                result.expiresInSeconds()
        );
    }
}

