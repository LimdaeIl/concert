package com.concert.backend.auth.application.command;

public record SignInCommand(
        String email,
        String password
) {

}
