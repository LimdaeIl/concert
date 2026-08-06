package com.concert.backend.auth.application.result;

import com.concert.backend.auth.infrastructure.oauth.userinfo.OAuth2UserInfo;

public record NewSocialMemberResult(
        OAuth2UserInfo userInfo
) implements SocialAuthenticationResult {
}
