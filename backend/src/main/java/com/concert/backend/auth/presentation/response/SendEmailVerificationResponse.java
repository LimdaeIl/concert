package com.concert.backend.auth.presentation.response;

public record SendEmailVerificationResponse(
        String email
) {

    public static SendEmailVerificationResponse of(
            String email
    ) {
        return new SendEmailVerificationResponse(email);
    }
}
