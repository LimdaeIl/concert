package com.concert.backend.member.presentation.response;

import com.concert.backend.member.application.result.SignUpResult;

public record SignUpResponse(
        Long memberId,
        String email,
        String name,
        String role,
        String status
) {

    public static SignUpResponse from(SignUpResult result) {
        return new SignUpResponse(
                result.memberId(),
                result.email(),
                result.name(),
                result.role().name(),
                result.status().name()
        );
    }
}
