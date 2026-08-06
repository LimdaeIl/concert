package com.concert.backend.auth.domain;

import java.time.Duration;
import java.util.Optional;

public interface OAuth2TicketRepository {

    void save(
            String ticketHash,
            OAuth2TicketPayload payload,
            Duration ttl
    );

    Optional<OAuth2TicketPayload> find(String ticketHash);

    boolean consume(
            String ticketHash,
            Long memberId
    );

    void deleteByMemberId(Long memberId);
}
