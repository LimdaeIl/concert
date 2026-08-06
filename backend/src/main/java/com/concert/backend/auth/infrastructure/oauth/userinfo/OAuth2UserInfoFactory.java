package com.concert.backend.auth.infrastructure.oauth.userinfo;

import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OAuth2UserInfoFactory {

    private final GoogleOAuth2UserInfoExtractor googleExtractor;
    private final KakaoOAuth2UserInfoExtractor kakaoExtractor;
    private final GithubOAuth2UserInfoExtractor githubExtractor;

    public OAuth2UserInfo create(String registrationId, Map<String, Object> attributes) {
        if (registrationId == null || registrationId.isBlank()) {
            throw new IllegalArgumentException("OAuth2 registrationId는 필수입니다.");
        }

        String normalizedRegistrationId = registrationId.toLowerCase(Locale.ROOT);

        return switch (normalizedRegistrationId) {
            case "google" -> googleExtractor.extract(attributes);
            case "kakao" -> kakaoExtractor.extract(attributes);
            case "github" -> githubExtractor.extract(attributes);
            default -> throw new IllegalArgumentException(
                    "지원하지 않는 OAuth2 provider입니다: "
                            + registrationId
            );
        };
    }
}
