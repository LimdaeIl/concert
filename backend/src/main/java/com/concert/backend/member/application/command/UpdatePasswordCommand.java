package com.concert.backend.member.application.command;

public record UpdatePasswordCommand(
        String currentPassword,
        String newPassword
) {
}
