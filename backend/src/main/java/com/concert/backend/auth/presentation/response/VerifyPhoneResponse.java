package com.concert.backend.auth.presentation.response;

import com.concert.backend.auth.application.result.VerifyPhoneResult;

public record VerifyPhoneResponse(
        String phone,
        String verificationToken,
        long expiresInSeconds
) {

    public static VerifyPhoneResponse from(VerifyPhoneResult result) {
        return new VerifyPhoneResponse(
                result.phone(),
                result.verificationToken(),
                result.expiresInSeconds()
        );
    }
}
