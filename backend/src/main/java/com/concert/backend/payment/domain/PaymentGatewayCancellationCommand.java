package com.concert.backend.payment.domain;

import java.util.Map;

public record PaymentGatewayCancellationCommand(
        String providerPaymentId,
        Long amount,
        String reason,
        Map<String, String> providerData
) {
}
