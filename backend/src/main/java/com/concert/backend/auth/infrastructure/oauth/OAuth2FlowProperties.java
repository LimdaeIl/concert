package com.concert.backend.auth.infrastructure.oauth;

import java.net.URI;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.oauth2.flow")
public record OAuth2FlowProperties(
        URI loginSuccessRedirectUri,
        URI signupRedirectUri,
        URI failureRedirectUri,
        Duration loginCodeExpiration,
        Duration signupTicketExpiration
) {

    public OAuth2FlowProperties {
        requireHttpUri(loginSuccessRedirectUri, "loginSuccessRedirectUri");
        requireHttpUri(signupRedirectUri, "signupRedirectUri");
        requireHttpUri(failureRedirectUri, "failureRedirectUri");

        validateDuration(loginCodeExpiration, "loginCodeExpiration");
        validateDuration(signupTicketExpiration, "signupTicketExpiration");
    }

    private static void requireHttpUri(URI uri, String fieldName) {
        if (uri == null
                || uri.getScheme() == null
                || (!"http".equalsIgnoreCase(uri.getScheme())
                && !"https".equalsIgnoreCase(uri.getScheme()))) {throw new IllegalArgumentException(fieldName + "는 유효한 HTTP(S) URI여야 합니다."
            );
        }
    }

    private static void validateDuration(
            Duration duration,
            String fieldName
    ) {
        if (duration == null
                || duration.isZero()
                || duration.isNegative()) {
            throw new IllegalArgumentException(fieldName + "는 양수여야 합니다.");
        }
    }
}
