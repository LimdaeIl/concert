package com.concert.backend.member.application.command;

import java.math.BigDecimal;

public record SocialSignUpCommand(
        String ticket,
        String phone,
        String phoneVerificationToken,
        String roadAddress,
        String jibunAddress,
        String detailAddress,
        String zipCode,
        BigDecimal latitude,
        BigDecimal longitude
) {
}
