package com.concert.backend.auth.presentation.response;

public record SendPhoneVerificationResponse(
        String phone,
        long expiresInSeconds
) {

    private static final long CODE_EXPIRES_IN_SECONDS = 180L;

    public static SendPhoneVerificationResponse of(String phone) {
        return new SendPhoneVerificationResponse(
                phone,
                CODE_EXPIRES_IN_SECONDS
        );
    }
}
