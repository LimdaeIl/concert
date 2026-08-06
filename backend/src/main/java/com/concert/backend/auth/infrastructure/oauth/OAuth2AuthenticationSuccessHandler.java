package com.concert.backend.auth.infrastructure.oauth;

import com.concert.backend.auth.application.OAuth2IssuedTicket;
import com.concert.backend.auth.application.OAuth2TicketIssueService;
import com.concert.backend.auth.application.SocialAuthenticationService;
import com.concert.backend.auth.application.result.SocialAuthenticationResult;
import com.concert.backend.auth.infrastructure.oauth.userinfo.OAuth2UserInfo;
import com.concert.backend.auth.infrastructure.oauth.userinfo.OAuth2UserInfoFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler
        implements AuthenticationSuccessHandler {

    private final OAuth2UserInfoFactory userInfoFactory;
    private final SocialAuthenticationService socialAuthenticationService;
    private final OAuth2TicketIssueService ticketIssueService;

    private final OAuth2FlowProperties flowProperties;
    private final CookieOAuth2AuthorizationRequestRepository
            authorizationRequestRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        try {
            OAuth2AuthenticationToken oauthToken = requireOAuth2Authentication(authentication);

            OAuth2User principal = oauthToken.getPrincipal();

            OAuth2UserInfo userInfo = userInfoFactory.create(
                    oauthToken.getAuthorizedClientRegistrationId(),
                    principal.getAttributes()
            );

            SocialAuthenticationResult authenticationResult =
                    socialAuthenticationService.authenticate(userInfo);

            OAuth2IssuedTicket issuedTicket =
                    ticketIssueService.issue(authenticationResult);

            authorizationRequestRepository
                    .deleteAuthorizationRequestCookie(response);

            String redirectUri = buildRedirectUri(issuedTicket);

            response.sendRedirect(redirectUri);
        } catch (RuntimeException exception) {
            authorizationRequestRepository.deleteAuthorizationRequestCookie(response);

            String failureUri = UriComponentsBuilder
                    .fromUri(flowProperties.failureRedirectUri())
                    .queryParam("error", "oauth2_login_failed")
                    .build()
                    .encode()
                    .toUriString();

            response.sendRedirect(failureUri);
        }
    }

    private OAuth2AuthenticationToken requireOAuth2Authentication(Authentication authentication) {
        if (!(authentication
                instanceof OAuth2AuthenticationToken oauthToken)) {
            throw new IllegalStateException("OAuth2 인증 정보가 아닙니다.");
        }

        return oauthToken;
    }

    private String buildRedirectUri(
            OAuth2IssuedTicket ticket
    ) {
        if (ticket.isLogin()) {
            return UriComponentsBuilder
                    .fromUri(flowProperties.loginSuccessRedirectUri())
                    .queryParam("code", ticket.value())
                    .build()
                    .encode()
                    .toUriString();
        }

        return UriComponentsBuilder
                .fromUri(flowProperties.signupRedirectUri())
                .queryParam("ticket", ticket.value())
                .build()
                .encode()
                .toUriString();
    }
}
