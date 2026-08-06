package com.concert.backend.member.application.event;

public record MemberPhoneChangedEvent(
        String phoneVerificationToken
) {
}

