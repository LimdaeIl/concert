package com.concert.backend.auth.application;

import com.concert.backend.auth.application.command.SignInCommand;
import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.auth.infrastructure.jwt.JwtTokenProvider;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SignInService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository tokenRepository;
    private final JWTHashUtil jwtHashUtil;

    @Transactional
    public SignInResult signIn(SignInCommand command) {
        Member member = memberRepository.findByEmail(command.email())
                .orElseThrow(
                        () -> new AuthException(AuthErrorCode.INVALID_SIGN_IN)
                );

        validateSignIn(member, command.password());

        String accessToken = jwtTokenProvider.createAccessToken(
                member.getId(),
                member.getRole().name()
        );

        String refreshToken = jwtTokenProvider.createRefreshToken(
                member.getId()
        );

        long refreshTokenRemainingMillis =
                jwtTokenProvider.getRefreshTokenRemainingMillis(refreshToken);

        String hashedToken = jwtHashUtil.sha256(refreshToken);

        tokenRepository.save(
                member.getId(),
                hashedToken,
                Duration.ofMillis(refreshTokenRemainingMillis)
        );

        return SignInResult.of(
                member.getId(),
                accessToken,
                refreshToken,
                jwtTokenProvider.getRefreshTokenRemainingSeconds(refreshToken)
        );
    }

    private void validateSignIn(
            Member member,
            String rawPassword
    ) {
        if (!member.isSignInAllowed()) {
            throw new AuthException(AuthErrorCode.INVALID_SIGN_IN);
        }

        if (!passwordEncoder.matches(
                rawPassword,
                member.getPassword()
        )) {
            throw new AuthException(AuthErrorCode.INVALID_SIGN_IN);
        }
    }
}
