package com.concert.backend.auth.infrastructure.oauth.userinfo;

import com.concert.backend.member.domain.SocialProvider;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class GoogleOAuth2UserInfoExtractor {

    public OAuth2UserInfo extract(Map<String, Object> attributes) {
        return new OAuth2UserInfo(
                SocialProvider.GOOGLE,
                requiredString(attributes, "sub"),
                nullableString(attributes, "email"),
                nullableString(attributes, "name")
        );
    }

    private String requiredString(
            Map<String, Object> attributes,
            String key
    ) {
        String value = nullableString(attributes, key);

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "Google 사용자 정보에 " + key + " 값이 없습니다."
            );
        }

        return value;
    }

    private String nullableString(
            Map<String, Object> attributes,
            String key
    ) {
        Object value = attributes.get(key);
        return value == null ? null : String.valueOf(value);
    }
}
