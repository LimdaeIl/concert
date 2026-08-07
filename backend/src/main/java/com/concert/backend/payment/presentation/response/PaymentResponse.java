package com.concert.backend.payment.presentation.response;

import com.concert.backend.payment.application.result.PaymentResult;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long paymentId,
        String paymentNumber,
        Long reservationId,
        String provider,
        String method,
        String providerPaymentId,
        Long amount,
        String status,
        String failureCode,
        String failureMessage,
        LocalDateTime requestedAt,
        LocalDateTime approvedAt,
        LocalDateTime cancelledAt
) {

    public static PaymentResponse from(
            PaymentResult result
    ) {
        return new PaymentResponse(
                result.paymentId(),
                result.paymentNumber(),
                result.reservationId(),
                result.provider().name(),
                result.method() == null
                        ? null
                        : result.method().name(),
                result.providerPaymentId(),
                result.amount(),
                result.status().name(),
                result.failureCode(),
                result.failureMessage(),
                result.requestedAt(),
                result.approvedAt(),
                result.cancelledAt()
        );
    }
}
