package com.concert.backend.member.application.result;

public record SocialSignUpResult(
        Long memberId,
        String accessToken,
        String refreshToken,
        long refreshTokenRemainingSecond
) {

    public static SocialSignUpResult of(
            Long memberId,
            String accessToken,
            String refreshToken,
            long refreshTokenRemainingSecond
    ) {
        return new SocialSignUpResult(
                memberId,
                accessToken,
                refreshToken,
                refreshTokenRemainingSecond
        );
    }
}
