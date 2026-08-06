package com.concert.backend.auth.infrastructure.oauth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;
import tools.jackson.databind.json.JsonMapper;

@Component
@RequiredArgsConstructor
public class CookieOAuth2AuthorizationRequestRepository implements
        AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_PATH = "/";
    private static final String SAME_SITE = "Lax";

    private final JsonMapper jsonMapper;
    private final OAuth2CookieCipher cookieCipher;
    private final OAuth2CookieProperties properties;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(
            HttpServletRequest request
    ) {
        Cookie cookie = WebUtils.getCookie(request, properties.name());

        if (cookie == null
                || cookie.getValue() == null
                || cookie.getValue().isBlank()) {
            return null;
        }

        try {
            byte[] plainText = cookieCipher.decrypt(cookie.getValue());

            OAuth2AuthorizationRequestPayload payload =
                    jsonMapper.readValue(
                            plainText,
                            OAuth2AuthorizationRequestPayload.class
                    );

            return payload.toAuthorizationRequest();
        } catch (OAuth2CookieException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new OAuth2CookieException(
                    "OAuth2 인증 요청 쿠키 역직렬화에 실패했습니다.",
                    exception
            );
        }
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (authorizationRequest == null) {
            deleteAuthorizationRequestCookie(response);
            return;
        }

        try {
            OAuth2AuthorizationRequestPayload payload =
                    OAuth2AuthorizationRequestPayload.from(
                            authorizationRequest
                    );

            byte[] serialized = jsonMapper.writeValueAsBytes(payload);
            String encryptedValue = cookieCipher.encrypt(serialized);

            ResponseCookie cookie = ResponseCookie
                    .from(properties.name(), encryptedValue)
                    .httpOnly(true)
                    .secure(properties.secure())
                    .sameSite(SAME_SITE)
                    .path(COOKIE_PATH)
                    .maxAge(properties.expiration())
                    .build();

            response.addHeader("Set-Cookie", cookie.toString());
        } catch (OAuth2CookieException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new OAuth2CookieException(
                    "OAuth2 인증 요청 쿠키 직렬화에 실패했습니다.",
                    exception
            );
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        OAuth2AuthorizationRequest authorizationRequest =
                loadAuthorizationRequest(request);

        deleteAuthorizationRequestCookie(response);

        return authorizationRequest;
    }

    public void deleteAuthorizationRequestCookie(
            HttpServletResponse response
    ) {
        ResponseCookie cookie = ResponseCookie
                .from(properties.name(), "")
                .httpOnly(true)
                .secure(properties.secure())
                .sameSite(SAME_SITE)
                .path(COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }
}
