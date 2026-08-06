package com.concert.backend.auth.infrastructure.oauth.userinfo;

import com.concert.backend.member.domain.SocialProvider;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class GithubOAuth2UserInfoExtractor {

    public OAuth2UserInfo extract(Map<String, Object> attributes) {
        String name = nullableString(attributes, "name");

        if (name == null || name.isBlank()) {
            name = nullableString(attributes, "login");
        }

        return new OAuth2UserInfo(
                SocialProvider.GITHUB,
                requiredString(attributes, "id"),
                nullableString(attributes, "email"),
                name
        );
    }

    private String requiredString(Map<String, Object> attributes, String key) {
        String value = nullableString(attributes, key);

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("GitHub 사용자 정보에 " + key + " 값이 없습니다.");
        }

        return value;
    }

    private String nullableString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value == null ? null : String.valueOf(value);
    }
}
