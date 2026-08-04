package com.concert.backend.auth.infrastructure.redis;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.phone-verification")
public record PhoneVerificationProperties(
        long codeExpirationSeconds,
        long tokenExpirationSeconds,
        int maxFailedAttempts
) {

    public PhoneVerificationProperties {
        if (codeExpirationSeconds <= 0) {
            throw new IllegalArgumentException("휴대전화 인증번호 만료 시간은 양수여야 합니다.");
        }

        if (tokenExpirationSeconds <= 0) {
            throw new IllegalArgumentException("휴대전화 인증 토큰 만료 시간은 양수여야 합니다.");
        }

        if (maxFailedAttempts <= 0) {
            throw new IllegalArgumentException("휴대전화 인증 최대 실패 횟수는 양수여야 합니다.");
        }
    }
}
