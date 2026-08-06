package com.concert.backend.auth.infrastructure.oauth.userinfo;

import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.member.domain.SocialProvider;

public record OAuth2UserInfo(
        SocialProvider provider,
        String providerUserId,
        String email,
        String name
) {

    public OAuth2UserInfo {
        if (provider == null) {
            throw new AuthException(AuthErrorCode.OAUTH2_PROVIDER_NOT_SUPPORTED);
        }

        if (providerUserId == null || providerUserId.isBlank()) {
            throw new AuthException(AuthErrorCode.INVALID_OAUTH2_USER_INFO);
        }
    }

    public boolean hasEmail() {
        return email != null && !email.isBlank();
    }

    public boolean hasName() {
        return name != null && !name.isBlank();
    }
}
