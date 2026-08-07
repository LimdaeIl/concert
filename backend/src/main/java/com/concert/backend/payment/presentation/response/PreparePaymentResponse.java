package com.concert.backend.payment.presentation.response;

import com.concert.backend.payment.application.result.PaymentResult;

public record PreparePaymentResponse(
        Long paymentId,
        String paymentNumber,
        String provider,
        Long amount
) {

    public static PreparePaymentResponse from(
            PaymentResult result
    ) {
        return new PreparePaymentResponse(
                result.paymentId(),
                result.paymentNumber(),
                result.provider().name(),
                result.amount()
        );
    }
}
