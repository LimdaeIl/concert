package com.concert.backend.auth.infrastructure.security;

import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JwtTokenProvider;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
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
    private final MemberRepository memberRepository;
    private final JwtAuthenticationFailureHandler authenticationFailureHandler;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization =
                request.getHeader(AUTHORIZATION_HEADER);

        if (authorization == null
                || !authorization.startsWith(
                AUTHORIZATION_HEADER_PREFIX
        )) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = authorization.substring(
                AUTHORIZATION_HEADER_PREFIX.length()
        );

        try {
            Long memberId =
                    jwtProvider.getMemberIdFromAccessToken(accessToken);

            /*
             * JWT 안의 역할이나 회원 상태만 신뢰하지 않고
             * DB의 최신 회원 상태를 확인한다.
             */
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() ->
                            new AuthException(
                                    AuthErrorCode.INVALID_ACCESS_TOKEN
                            )
                    );

            if (!member.isSignInAllowed()) {
                throw new AuthException(
                        AuthErrorCode.INVALID_ACCESS_TOKEN
                );
            }

            String currentRole = member.getRole().name();

            LoginMember loginMember = new LoginMember(
                    member.getId(),
                    currentRole
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            loginMember,
                            null,
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_" + currentRole
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


