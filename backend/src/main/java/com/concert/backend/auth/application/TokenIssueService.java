package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.auth.infrastructure.jwt.JwtTokenProvider;
import com.concert.backend.member.domain.Member;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TokenIssueService {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JWTHashUtil jwtHashUtil;

    public SignInResult issue(Member member) {
        String accessToken = jwtTokenProvider.createAccessToken(member.getId(),
                member.getRole().name());

        String refreshToken = jwtTokenProvider.createRefreshToken(member.getId());

        long refreshTokenRemainingMillis = jwtTokenProvider.getRefreshTokenRemainingMillis(refreshToken);

        String hashedRefreshToken = jwtHashUtil.sha256(refreshToken);

        refreshTokenRepository.save(
                member.getId(),
                hashedRefreshToken,
                Duration.ofMillis(refreshTokenRemainingMillis)
        );

        return SignInResult.of(
                member.getId(),
                accessToken,
                refreshToken,
                jwtTokenProvider.getRefreshTokenRemainingSeconds(
                        refreshToken
                )
        );
    }
}
