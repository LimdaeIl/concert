package com.concert.backend.auth.infrastructure.security;

import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String AUTHORIZATION_HEADER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtProvider;
    private final JwtAuthenticationFailureHandler authenticationFailureHandler;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader(AUTHORIZATION_HEADER);

        if (authorization == null
                || !authorization.startsWith(AUTHORIZATION_HEADER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = authorization.substring(
                AUTHORIZATION_HEADER_PREFIX.length()
        );

        try {
            Long memberId =
                    jwtProvider.getMemberIdFromAccessToken(accessToken);

            String role =
                    jwtProvider.getRoleFromAccessToken(accessToken);

            LoginMember loginMember = new LoginMember(
                    memberId,
                    role
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            loginMember,
                            null,
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_" + role
                                    )
                            )
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (AuthException exception) {
            SecurityContextHolder.clearContext();

            authenticationFailureHandler.handle(
                    request,
                    response,
                    exception
            );
        }
    }
}
