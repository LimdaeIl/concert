package com.concert.backend.auth.infrastructure.redis;

import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.RotateResult;
import java.time.Duration;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class RedisRefreshTokenRepository implements RefreshTokenRepository {

    private static final String KEY_PREFIX = "auth:refresh-token:";

    /*
     * 저장된 Refresh Token Hash가 기존 Token Hash와 일치할 때만
     * 새로운 Refresh Token Hash로 원자적으로 교체합니다.
     *
     * 반환값:
     *  1  : 교체 성공
     *  0  : 기존 토큰 불일치
     * -1  : 저장된 토큰 없음
     */
    private static final DefaultRedisScript<Long> ROTATE_IF_MATCHES_SCRIPT =
            new DefaultRedisScript<>(
                    """
                            local current = redis.call('GET', KEYS[1])
                            
                            if current == false then
                                return -1
                            end
                            
                            if current ~= ARGV[1] then
                                return 0
                            end
                            
                            redis.call('PSETEX', KEYS[1], ARGV[3], ARGV[2])
                            return 1
                            """,
                    Long.class
            );

    private final StringRedisTemplate redisTemplate;

    @Override
    public void save(Long memberId, String hashedRefreshToken, Duration ttl) {
        validateMemberId(memberId);
        validateToken(hashedRefreshToken);
        validateRefreshTokenTtl(ttl);

        execute(() ->
                redisTemplate.opsForValue().set(key(memberId), hashedRefreshToken, ttl)
        );
    }

    @Override
    public Optional<String> findByMemberId(Long memberId) {
        validateMemberId(memberId);

        return executeWithResult(
                () -> Optional.ofNullable(redisTemplate.opsForValue().get(key(memberId)))
        );
    }

    @Override
    public void deleteByMemberId(Long memberId) {
        validateMemberId(memberId);

        execute(() -> redisTemplate.delete(key(memberId)));
    }

    @Override
    public void rotateIfMatches(
            Long memberId,
            String hashedOldRefreshToken,
            String hashedNewRefreshToken,
            Duration refreshTokenTtl
    ) {
        validateMemberId(memberId);
        validateToken(hashedOldRefreshToken);
        validateToken(hashedNewRefreshToken);
        validateRefreshTokenTtl(refreshTokenTtl);

        Long resultCode = executeWithResult(() ->
                redisTemplate.execute(
                        ROTATE_IF_MATCHES_SCRIPT,
                        Collections.singletonList(key(memberId)),
                        hashedOldRefreshToken,
                        hashedNewRefreshToken,
                        Long.toString(refreshTokenTtl.toMillis())
                )
        );

        RotateResult result = RotateResult.from(resultCode);

        switch (result) {
            case SUCCESS -> {
                return;
            }

            case NOT_FOUND, MISMATCH ->
                    throw new AuthException(AuthErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

    private void validateMemberId(Long memberId) {
        if (memberId == null || memberId <= 0) {
            throw new AuthException(AuthErrorCode.TOKEN_STORE_UNAVAILABLE);
        }
    }

    private void validateToken(String token) {
        if (token == null || token.isBlank()) {
            throw new AuthException(AuthErrorCode.TOKEN_STORE_UNAVAILABLE);
        }
    }

    private void validateRefreshTokenTtl(Duration ttl) {
        if (ttl == null || ttl.isZero() || ttl.isNegative()) {
            throw new AuthException(AuthErrorCode.TOKEN_STORE_UNAVAILABLE);
        }
    }

    private String key(Long memberId) {
        return KEY_PREFIX + memberId;
    }

    private void execute(Runnable operation) {
        try {
            operation.run();
        } catch (DataAccessException exception) {
            throw new AuthException(AuthErrorCode.TOKEN_STORE_UNAVAILABLE, exception);
        }
    }

    private <T> T executeWithResult(RedisOperation<T> operation) {
        try {
            return operation.execute();
        } catch (DataAccessException exception) {
            throw new AuthException(AuthErrorCode.TOKEN_STORE_UNAVAILABLE, exception);
        }
    }

    @FunctionalInterface
    private interface RedisOperation<T> {

        T execute();
    }
}
