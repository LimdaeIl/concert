package com.concert.backend.auth.application.result;

public record VerifyPhoneResult(
        String phone,
        String verificationToken,
        long expiresInSeconds
) {

    public static VerifyPhoneResult of(String phone, String verificationToken, long expiresInSeconds) {
        return new VerifyPhoneResult(phone, verificationToken, expiresInSeconds);
    }
}
