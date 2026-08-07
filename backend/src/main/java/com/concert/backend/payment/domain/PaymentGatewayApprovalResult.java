package com.concert.backend.payment.domain;

import java.time.LocalDateTime;

public record PaymentGatewayApprovalResult(
        String providerPaymentId,
        Long amount,
        PaymentMethod method,
        LocalDateTime approvedAt
) {
}
