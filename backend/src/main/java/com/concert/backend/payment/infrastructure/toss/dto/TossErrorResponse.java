package com.concert.backend.payment.infrastructure.toss.dto;

public record TossErrorResponse(
        String code,
        String message
) {
}
