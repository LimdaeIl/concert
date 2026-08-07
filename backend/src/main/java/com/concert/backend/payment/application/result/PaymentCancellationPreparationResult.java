package com.concert.backend.payment.application.result;

import com.concert.backend.payment.domain.PaymentProvider;

public record PaymentCancellationPreparationResult(
        Long paymentId,
        Long paymentCancellationId,
        PaymentProvider provider,
        String providerPaymentId,
        Long amount,
        String reason
) {
}
