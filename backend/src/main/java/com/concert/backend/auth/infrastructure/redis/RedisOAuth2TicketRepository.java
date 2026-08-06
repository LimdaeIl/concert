package com.concert.backend.auth.infrastructure.redis;

import com.concert.backend.auth.domain.OAuth2TicketPayload;
import com.concert.backend.auth.domain.OAuth2TicketRepository;
import java.time.Duration;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@RequiredArgsConstructor
@Repository
public class RedisOAuth2TicketRepository
        implements OAuth2TicketRepository {

    private static final String KEY_PREFIX = "auth:oauth2:ticket:";

    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;

    @Override
    public void save(
            String ticketHash,
            OAuth2TicketPayload payload,
            Duration ttl
    ) {
        try {
            String value = jsonMapper.writeValueAsString(payload);

            redisTemplate.opsForValue().set(
                    key(ticketHash),
                    value,
                    ttl
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "OAuth2 티켓 저장에 실패했습니다.",
                    exception
            );
        }
    }

    @Override
    public Optional<OAuth2TicketPayload> find(String ticketHash) {
        String value = redisTemplate.opsForValue()
                .get(key(ticketHash));

        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        try {
            return Optional.of(
                    jsonMapper.readValue(
                            value,
                            OAuth2TicketPayload.class
                    )
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "OAuth2 티켓 복원에 실패했습니다.",
                    exception
            );
        }
    }

    @Override
    public boolean consume(String ticketHash) {
        return Boolean.TRUE.equals(
                redisTemplate.delete(key(ticketHash))
        );
    }

    private String key(String ticketHash) {
        return KEY_PREFIX + ticketHash;
    }
}