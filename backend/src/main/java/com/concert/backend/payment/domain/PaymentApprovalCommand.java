package com.concert.backend.payment.domain;

public record PaymentApprovalCommand(
        String paymentKey,
        String orderId,
        Long amount
) {
}
