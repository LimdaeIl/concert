package com.concert.backend.member.application.command;

public record UpdatePhoneCommand(
        String phone,
        String phoneVerificationToken
) {
}
