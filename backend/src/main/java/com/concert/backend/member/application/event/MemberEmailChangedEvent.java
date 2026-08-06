package com.concert.backend.member.application.event;

public record MemberEmailChangedEvent(
        String emailVerificationToken
) {
}
