package com.concert.backend.auth.infrastructure.oauth;

import java.time.Duration;
import java.util.Base64;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.oauth2.authorization-request-cookie")
public record OAuth2CookieProperties(
        String name,
        String encryptionKey,
        Duration expiration,
        boolean secure
) {

    private static final int AES_256_KEY_LENGTH = 32;

    public OAuth2CookieProperties {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("OAuth2 authorization request cookie name은 필수입니다.");
        }

        if (encryptionKey == null || encryptionKey.isBlank()) {
            throw new IllegalArgumentException(
                    "OAuth2 authorization request cookie encryption key는 필수입니다.");
        }

        byte[] decodedKey;

        try {
            decodedKey = Base64.getDecoder().decode(encryptionKey);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "OAuth2 cookie encryption key는 Base64 형식이어야 합니다.",
                    exception
            );
        }

        if (decodedKey.length != AES_256_KEY_LENGTH) {
            throw new IllegalArgumentException(
                    "OAuth2 cookie encryption key는 Base64 디코딩 후 32바이트여야 합니다."
            );
        }

        if (expiration == null
                || expiration.isZero()
                || expiration.isNegative()) {
            throw new IllegalArgumentException(
                    "OAuth2 authorization request cookie expiration은 양수여야 합니다."
            );
        }
    }
}
