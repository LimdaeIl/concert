package com.concert.backend.auth.domain;

import com.concert.backend.member.domain.SocialProvider;
import com.fasterxml.jackson.annotation.JsonIgnore;

public record OAuth2TicketPayload(
        OAuth2TicketType type,
        Long memberId,
        SocialProvider provider,
        String providerUserId,
        String email,
        String name
) {

    public static OAuth2TicketPayload login(Long memberId) {
        return new OAuth2TicketPayload(
                OAuth2TicketType.LOGIN,
                memberId,
                null,
                null,
                null,
                null
        );
    }

    public static OAuth2TicketPayload signup(
            SocialProvider provider,
            String providerUserId,
            String email,
            String name
    ) {
        return new OAuth2TicketPayload(
                OAuth2TicketType.SIGNUP,
                null,
                provider,
                providerUserId,
                email,
                name
        );
    }

    @JsonIgnore
    public boolean isLoginTicket() {
        return type == OAuth2TicketType.LOGIN;
    }

    @JsonIgnore
    public boolean isSignupTicket() {
        return type == OAuth2TicketType.SIGNUP;
    }
}
