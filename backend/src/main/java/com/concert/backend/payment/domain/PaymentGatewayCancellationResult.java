package com.concert.backend.payment.domain;

import java.time.LocalDateTime;

public record PaymentGatewayCancellationResult(
        String providerCancellationId,
        Long cancelledAmount,
        LocalDateTime cancelledAt
) {
}
