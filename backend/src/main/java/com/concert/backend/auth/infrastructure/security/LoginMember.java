package com.concert.backend.auth.infrastructure.security;

public record LoginMember(
        Long memberId,
        String role
) {

}
