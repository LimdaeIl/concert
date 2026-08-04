package com.concert.backend.auth.infrastructure.redis;

import com.concert.backend.auth.domain.PhoneVerificationRepository;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import java.time.Duration;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RedisPhoneVerificationRepository
        implements PhoneVerificationRepository {

    private static final String CODE_KEY_PREFIX = "auth:phone-verification:code:";
    private static final String FAILED_ATTEMPTS_KEY_PREFIX = "auth:phone-verification:failed-attempts:";
    private static final String TOKEN_KEY_PREFIX = "auth:phone-verification:token:";

    /*
     * 실패 횟수를 증가시키고 최초 생성 시에만 TTL을 설정합니다.
     *
     * KEYS[1] = 실패 횟수 Redis key
     * ARGV[1] = TTL 초
     */
    private static final DefaultRedisScript<Long> INCREMENT_WITH_EXPIRATION_SCRIPT =
            new DefaultRedisScript<>(
                    """
                    local attempts = redis.call('INCR', KEYS[1])
                    if attempts == 1 then
                        redis.call('EXPIRE', KEYS[1], ARGV[1])
                    end
                    return attempts
                    """,
                    Long.class
            );

    private final StringRedisTemplate redisTemplate;
    private final PhoneVerificationProperties properties;

    @Override
    public void saveCode(String phone, String verificationCode) {
        execute(() -> redisTemplate.opsForValue().set(
                codeKey(phone),
                verificationCode,
                Duration.ofSeconds(properties.codeExpirationSeconds())
        ));
    }

    @Override
    public Optional<String> findCode(String phone) {
        return executeWithResult(() ->
                Optional.ofNullable(redisTemplate.opsForValue().get(codeKey(phone)))
        );
    }

    @Override
    public void deleteCode(String phone) {
        execute(() -> redisTemplate.delete(codeKey(phone)));
    }

    @Override
    public long incrementFailedAttempts(String phone) {
        return executeWithResult(() -> redisTemplate.execute(
                        INCREMENT_WITH_EXPIRATION_SCRIPT,
                        Collections.singletonList(failedAttemptsKey(phone)),
                        Long.toString(properties.codeExpirationSeconds())
                )
        );
    }

    @Override
    public void deleteFailedAttempts(String phone) {
        execute(() -> redisTemplate.delete(failedAttemptsKey(phone)));
    }

    @Override
    public void saveVerificationToken(String verificationToken, String phone) {
        execute(() -> redisTemplate.opsForValue().set(
                tokenKey(verificationToken),
                phone,
                Duration.ofSeconds(properties.tokenExpirationSeconds())
        ));
    }

    @Override
    public Optional<String> findPhoneByVerificationToken(String verificationToken) {
        return executeWithResult(() ->
                Optional.ofNullable(redisTemplate.opsForValue().get(tokenKey(verificationToken)))
        );
    }

    @Override
    public void deleteVerificationToken(String verificationToken) {
        execute(() -> redisTemplate.delete(tokenKey(verificationToken)));
    }

    private String codeKey(String phone) {
        return CODE_KEY_PREFIX + phone;
    }

    private String failedAttemptsKey(String phone) {
        return FAILED_ATTEMPTS_KEY_PREFIX + phone;
    }

    private String tokenKey(String verificationToken) {
        return TOKEN_KEY_PREFIX + verificationToken;
    }

    private void execute(Runnable operation) {
        try {
            operation.run();
        } catch (DataAccessException exception) {
            throw new AuthException(AuthErrorCode.PHONE_VERIFICATION_STORE_UNAVAILABLE, exception);
        }
    }

    private <T> T executeWithResult(RedisOperation<T> operation) {
        try {
            return operation.execute();
        } catch (DataAccessException exception) {
            throw new AuthException(AuthErrorCode.PHONE_VERIFICATION_STORE_UNAVAILABLE, exception);
        }
    }

    @FunctionalInterface
    private interface RedisOperation<T> {
        T execute();
    }
}

