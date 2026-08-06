package com.concert.backend.member.application.event;

public record SocialMemberSignedUpEvent(
        String phoneVerificationToken
) {
}
