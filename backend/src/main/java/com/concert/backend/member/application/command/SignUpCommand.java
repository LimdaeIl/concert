package com.concert.backend.member.application.command;

import java.math.BigDecimal;

public record SignUpCommand(
        String email,
        String password,
        String name,
        String phone,
        String roadAddress,
        String jibunAddress,
        String detailAddress,
        String zipCode,
        BigDecimal latitude,
        BigDecimal longitude,
        String emailVerificationToken,
        String phoneVerificationToken
) {

}
