package com.concert.backend.auth.infrastructure.oauth.userinfo;

import com.concert.backend.member.domain.SocialProvider;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class KakaoOAuth2UserInfoExtractor {

    public OAuth2UserInfo extract(Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = mapValue(attributes, "kakao_account");

        Map<String, Object> profile = mapValue(kakaoAccount, "profile");

        return new OAuth2UserInfo(
                SocialProvider.KAKAO,
                requiredString(attributes, "id"),
                nullableString(kakaoAccount, "email"),
                nullableString(profile, "nickname")
        );
    }

    private String requiredString(Map<String, Object> attributes, String key) {
        String value = nullableString(attributes, key);

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Kakao 사용자 정보에 " + key + " 값이 없습니다.");
        }

        return value;
    }

    private String nullableString(Map<String, Object> attributes, String key) {
        if (attributes == null) {
            return null;
        }

        Object value = attributes.get(key);
        return value == null ? null : String.valueOf(value);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Map<String, Object> attributes, String key) {
        if (attributes == null) {
            return Map.of();
        }

        Object value = attributes.get(key);

        if (!(value instanceof Map<?, ?> source)) {
            return Map.of();
        }

        return (Map<String, Object>) source;
    }
}
