package com.concert.backend.auth.domain;

import java.time.Duration;
import java.util.Optional;

public interface RefreshTokenRepository {

    void save(
            Long memberId,
            String hashedRefreshToken,
            Duration ttl
    );

    Optional<String> findByMemberId(Long memberId);

    void deleteByMemberId(Long memberId);

    void rotateIfMatches(
            Long memberId,
            String hashedOldRefreshToken,
            String hashedNewRefreshToken,
            Duration refreshTokenTtl
    );
}
