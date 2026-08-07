package com.concert.backend.payment.domain;

import java.time.LocalDateTime;

public record PaymentApprovalResult(
        String paymentKey,
        String orderId,
        Long amount,
        PaymentMethod method,
        LocalDateTime approvedAt
) {
}
