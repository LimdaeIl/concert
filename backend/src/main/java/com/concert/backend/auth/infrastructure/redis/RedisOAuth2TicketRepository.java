package com.concert.backend.auth.infrastructure.redis;

import com.concert.backend.auth.domain.OAuth2TicketPayload;
import com.concert.backend.auth.domain.OAuth2TicketRepository;
import com.concert.backend.auth.domain.OAuth2TicketType;
import java.time.Duration;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@RequiredArgsConstructor
@Repository
public class RedisOAuth2TicketRepository
        implements OAuth2TicketRepository {

    private static final String TICKET_KEY_PREFIX =
            "auth:oauth2:ticket:";

    private static final String MEMBER_TICKETS_KEY_PREFIX =
            "auth:oauth2:member-tickets:";

    /*
     * LOGIN 티켓 저장과 회원 역색인 등록을 원자적으로 수행한다.
     *
     * KEYS[1] = ticket key
     * KEYS[2] = member ticket set key
     *
     * ARGV[1] = serialized payload
     * ARGV[2] = ticket hash
     * ARGV[3] = TTL milliseconds
     */
    private static final DefaultRedisScript<Long>
            SAVE_LOGIN_TICKET_SCRIPT =
            new DefaultRedisScript<>(
                    """
                    redis.call(
                        'PSETEX',
                        KEYS[1],
                        ARGV[3],
                        ARGV[1]
                    )

                    redis.call(
                        'SADD',
                        KEYS[2],
                        ARGV[2]
                    )

                    redis.call(
                        'PEXPIRE',
                        KEYS[2],
                        ARGV[3]
                    )

                    return 1
                    """,
                    Long.class
            );

    /*
     * 티켓 삭제와 회원 역색인 제거를 원자적으로 수행한다.
     *
     * 반환:
     * 1 = 티켓 소비 성공
     * 0 = 이미 소비되었거나 만료됨
     */
    private static final DefaultRedisScript<Long>
            CONSUME_LOGIN_TICKET_SCRIPT =
            new DefaultRedisScript<>(
                    """
                    local deleted = redis.call(
                        'DEL',
                        KEYS[1]
                    )

                    if deleted == 0 then
                        return 0
                    end

                    redis.call(
                        'SREM',
                        KEYS[2],
                        ARGV[1]
                    )

                    if redis.call('SCARD', KEYS[2]) == 0 then
                        redis.call('DEL', KEYS[2])
                    end

                    return 1
                    """,
                    Long.class
            );

    /*
     * 회원의 미사용 LOGIN 티켓과 역색인 Set을 모두 삭제한다.
     *
     * KEYS[1] = member ticket set key
     * ARGV[1] = ticket key prefix
     *
     * 반환값 = 삭제를 시도한 티켓 개수
     */
    private static final DefaultRedisScript<Long>
            DELETE_MEMBER_TICKETS_SCRIPT =
            new DefaultRedisScript<>(
                    """
                    local ticketHashes =
                        redis.call('SMEMBERS', KEYS[1])

                    for _, ticketHash in ipairs(ticketHashes) do
                        redis.call(
                            'DEL',
                            ARGV[1] .. ticketHash
                        )
                    end

                    redis.call('DEL', KEYS[1])

                    return #ticketHashes
                    """,
                    Long.class
            );

    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;

    @Override
    public void save(
            String ticketHash,
            OAuth2TicketPayload payload,
            Duration ttl
    ) {
        validateTicketHash(ticketHash);
        validatePayload(payload);
        validateTtl(ttl);

        String serializedPayload = serialize(payload);

        if (payload.type() == OAuth2TicketType.LOGIN) {
            saveLoginTicket(
                    ticketHash,
                    payload.memberId(),
                    serializedPayload,
                    ttl
            );
            return;
        }

        saveSignupTicket(
                ticketHash,
                serializedPayload,
                ttl
        );
    }

    @Override
    public Optional<OAuth2TicketPayload> find(
            String ticketHash
    ) {
        validateTicketHash(ticketHash);

        String value = redisTemplate.opsForValue()
                .get(ticketKey(ticketHash));

        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        return Optional.of(deserialize(value));
    }

    @Override
    public boolean consume(
            String ticketHash,
            Long memberId
    ) {
        validateTicketHash(ticketHash);

        /*
         * SIGNUP 티켓은 memberId가 없기 때문에
         * 역색인 없이 ticket key만 삭제한다.
         */
        if (memberId == null) {
            return Boolean.TRUE.equals(
                    redisTemplate.delete(
                            ticketKey(ticketHash)
                    )
            );
        }

        Long result = redisTemplate.execute(
                CONSUME_LOGIN_TICKET_SCRIPT,
                java.util.List.of(
                        ticketKey(ticketHash),
                        memberTicketsKey(memberId)
                ),
                ticketHash
        );

        return result != null && result == 1L;
    }

    @Override
    public void deleteByMemberId(Long memberId) {
        validateMemberId(memberId);

        redisTemplate.execute(
                DELETE_MEMBER_TICKETS_SCRIPT,
                Collections.singletonList(
                        memberTicketsKey(memberId)
                ),
                TICKET_KEY_PREFIX
        );
    }

    private void saveLoginTicket(
            String ticketHash,
            Long memberId,
            String serializedPayload,
            Duration ttl
    ) {
        validateMemberId(memberId);

        redisTemplate.execute(
                SAVE_LOGIN_TICKET_SCRIPT,
                java.util.List.of(
                        ticketKey(ticketHash),
                        memberTicketsKey(memberId)
                ),
                serializedPayload,
                ticketHash,
                Long.toString(ttl.toMillis())
        );
    }

    private void saveSignupTicket(
            String ticketHash,
            String serializedPayload,
            Duration ttl
    ) {
        redisTemplate.opsForValue().set(
                ticketKey(ticketHash),
                serializedPayload,
                ttl
        );
    }

    private String serialize(
            OAuth2TicketPayload payload
    ) {
        try {
            return jsonMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "OAuth2 티켓 직렬화에 실패했습니다.",
                    exception
            );
        }
    }

    private OAuth2TicketPayload deserialize(
            String value
    ) {
        try {
            return jsonMapper.readValue(
                    value,
                    OAuth2TicketPayload.class
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "OAuth2 티켓 복원에 실패했습니다.",
                    exception
            );
        }
    }

    private String ticketKey(String ticketHash) {
        return TICKET_KEY_PREFIX + ticketHash;
    }

    private String memberTicketsKey(Long memberId) {
        return MEMBER_TICKETS_KEY_PREFIX + memberId;
    }

    private void validateTicketHash(String ticketHash) {
        if (ticketHash == null || ticketHash.isBlank()) {
            throw new IllegalArgumentException(
                    "OAuth2 ticket hash는 필수입니다."
            );
        }
    }

    private void validatePayload(
            OAuth2TicketPayload payload
    ) {
        if (payload == null || payload.type() == null) {
            throw new IllegalArgumentException(
                    "OAuth2 ticket payload는 필수입니다."
            );
        }

        if (payload.type() == OAuth2TicketType.LOGIN
                && payload.memberId() == null) {
            throw new IllegalArgumentException(
                    "LOGIN 티켓에는 memberId가 필요합니다."
            );
        }
    }

    private void validateMemberId(Long memberId) {
        if (memberId == null || memberId <= 0) {
            throw new IllegalArgumentException(
                    "유효한 memberId가 필요합니다."
            );
        }
    }

    private void validateTtl(Duration ttl) {
        if (ttl == null
                || ttl.isZero()
                || ttl.isNegative()) {
            throw new IllegalArgumentException(
                    "OAuth2 ticket TTL은 양수여야 합니다."
            );
        }
    }
}
