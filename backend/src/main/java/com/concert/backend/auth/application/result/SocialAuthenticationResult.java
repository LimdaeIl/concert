package com.concert.backend.auth.application.result;

public sealed interface SocialAuthenticationResult
        permits ExistingSocialMemberResult, NewSocialMemberResult {
}
