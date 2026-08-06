package com.concert.backend.member.application.command;

import java.math.BigDecimal;

public record UpdateMeCommand(
        String name,
        String roadAddress,
        String jibunAddress,
        String detailAddress,
        String zipCode,
        BigDecimal latitude,
        BigDecimal longitude
) {
}
