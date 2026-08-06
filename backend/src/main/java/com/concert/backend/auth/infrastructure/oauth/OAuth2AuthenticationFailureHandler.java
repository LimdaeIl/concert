package com.concert.backend.auth.infrastructure.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler
        implements AuthenticationFailureHandler {

    private final OAuth2FlowProperties flowProperties;

    private final CookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        authorizationRequestRepository.deleteAuthorizationRequestCookie(response);

        String redirectUri = UriComponentsBuilder
                .fromUri(flowProperties.failureRedirectUri())
                .queryParam("error", "oauth2_login_failed")
                .build()
                .encode()
                .toUriString();

        response.sendRedirect(redirectUri);
    }
}
