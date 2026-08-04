package com.concert.backend.auth.application.result;

public record SendPhoneVerificationResult(
        String phone,
        long expiresInSeconds
) {

    public static SendPhoneVerificationResult of(String phone, long expiresInSeconds) {
        return new SendPhoneVerificationResult(phone, expiresInSeconds);
    }
}
