package com.concert.backend.member.application.event;

public record MemberSignedUpEvent(
        String emailVerificationToken
) {
}
