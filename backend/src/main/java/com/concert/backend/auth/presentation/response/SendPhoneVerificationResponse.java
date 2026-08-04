package com.concert.backend.auth.presentation.response;

public record SendPhoneVerificationResponse(
        String phone,
        long expiresInSeconds
) {

    public static SendPhoneVerificationResponse of(String phone,  long expiresInSeconds) {
        return new SendPhoneVerificationResponse(phone, expiresInSeconds);
    }
}
