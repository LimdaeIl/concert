package com.concert.backend.auth.application.result;

public record VerifyEmailResult(
        String email,
        String verificationToken,
        long expiresInSeconds
) {

    public static VerifyEmailResult of(String email, String verificationToken, long expiresInSeconds) {
        return new VerifyEmailResult(email, verificationToken, expiresInSeconds);
    }
}
