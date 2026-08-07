package com.concert.backend.payment.infrastructure.toss.dto;

import java.time.OffsetDateTime;

public record TossPaymentResponse(
        String paymentKey,
        String orderId,
        Long totalAmount,
        String status,
        String method,
        OffsetDateTime approvedAt
) {
}
