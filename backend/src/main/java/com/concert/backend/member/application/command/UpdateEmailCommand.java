package com.concert.backend.member.application.command;

public record UpdateEmailCommand(
        String email,
        String emailVerificationToken
) {
}
