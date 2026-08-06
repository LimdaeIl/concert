package com.concert.backend.auth.application.result;

public record ExistingSocialMemberResult(
        Long memberId
) implements SocialAuthenticationResult {
}
