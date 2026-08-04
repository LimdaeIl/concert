package com.concert.backend.auth.infrastructure.sms;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "solapi")
public record SolapiProperties(
        String apiKey,
        String apiSecret,
        String sender
) {

    /*
     * ConfigurationProperties는 애플리케이션 시작 시 바인딩됩니다.
     *
     * 이 시점은 아직 HTTP 요청이나 비즈니스 로직이 수행되기 전이므로
     * AuthException 같은 비즈니스 예외를 사용하는 대상이 아닙니다.
     *
     * API Key가 비어 있다는 것은 사용자의 잘못된 요청이 아니라
     * 개발자 또는 운영 환경의 설정 오류이므로 IllegalArgumentException으로
     * 애플리케이션을 즉시 Fail-Fast 시킵니다.
     */
    public SolapiProperties {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("SOLAPI API Key는 비어 있을 수 없습니다.");
        }

        if (apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalArgumentException("SOLAPI API Secret은 비어 있을 수 없습니다.");
        }

        if (sender == null || sender.isBlank()) {
            throw new IllegalArgumentException("SOLAPI 발신번호는 비어 있을 수 없습니다.");
        }

        sender = sender.replaceAll("[^0-9]", "");
    }
}
