package com.concert.backend.payment.domain;

import java.util.Map;

public record PaymentGatewayApprovalCommand(
        String paymentNumber,
        Long amount,
        Map<String, String> providerData
) {
}
