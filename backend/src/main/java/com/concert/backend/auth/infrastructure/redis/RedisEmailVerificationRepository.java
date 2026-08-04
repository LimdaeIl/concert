package com.concert.backend.auth.infrastructure.redis;

import com.concert.backend.auth.domain.EmailVerificationRepository;
import java.time.Duration;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RedisEmailVerificationRepository implements EmailVerificationRepository {

    private static final String CODE_KEY_PREFIX = "auth:email-verification:code:";
    private static final String TOKEN_KEY_PREFIX = "auth:email-verification:token:";
    private static final Duration CODE_TTL = Duration.ofMinutes(5);
    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);

    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveCode(String email, String verificationCode) {
        redisTemplate.opsForValue().set(createCodeKey(email), verificationCode, CODE_TTL);
    }

    @Override
    public Optional<String> findCode(String email) {
        String verificationCode = redisTemplate.opsForValue().get(createCodeKey(email));
        return Optional.ofNullable(verificationCode);
    }

    @Override
    public void deleteCode(String email) {
        redisTemplate.delete(createCodeKey(email));
    }

    @Override
    public void saveVerificationToken(String verificationToken, String email) {
        redisTemplate.opsForValue().set(createTokenKey(verificationToken), email, TOKEN_TTL);
    }

    @Override
    public Optional<String> findEmailByVerificationToken(String verificationToken) {
        String email = redisTemplate.opsForValue().get(createTokenKey(verificationToken));

        return Optional.ofNullable(email);
    }

    @Override
    public void deleteVerificationToken(String verificationToken) {
        redisTemplate.delete(createTokenKey(verificationToken));
    }

    private String createCodeKey(String email) {
        return CODE_KEY_PREFIX + email;
    }

    private String createTokenKey(String verificationToken) {
        return TOKEN_KEY_PREFIX + verificationToken;
    }
}
