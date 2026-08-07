package com.concert.backend.payment.infrastructure.toss.dto;

public record TossConfirmPaymentRequest(
        String paymentKey,
        String orderId,
        Long amount
) {
}
