package com.concert.backend.auth.application;

import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.auth.infrastructure.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SignOutService {

    private final RefreshTokenRepository tokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JWTHashUtil jwtHashUtil;

    @Transactional
    public void signOut(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AuthException(AuthErrorCode.MISSING_REFRESH_TOKEN);
        }
        Long memberId = jwtTokenProvider.getMemberIdFromRefreshToken(refreshToken);
        String hashedRefreshToken = jwtHashUtil.sha256(refreshToken);

        String storedRefreshTokenHash = tokenRepository.findByMemberId(memberId)
                .orElseThrow(() -> new AuthException(AuthErrorCode.MISSING_REFRESH_TOKEN));

        if (!hashedRefreshToken.equals(storedRefreshTokenHash)) {
            throw new AuthException(AuthErrorCode.MISMATCH_REFRESH_TOKEN);
        }

        tokenRepository.deleteByMemberId(memberId);
    }
}

