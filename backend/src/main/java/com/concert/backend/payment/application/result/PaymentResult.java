package com.concert.backend.payment.application.result;

import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentMethod;
import com.concert.backend.payment.domain.PaymentProvider;
import com.concert.backend.payment.domain.PaymentStatus;
import java.time.LocalDateTime;

public record PaymentResult(
        Long paymentId,
        String paymentNumber,
        Long reservationId,
        PaymentProvider provider,
        PaymentMethod method,
        String providerPaymentId,
        Long amount,
        PaymentStatus status,
        String failureCode,
        String failureMessage,
        LocalDateTime requestedAt,
        LocalDateTime approvedAt,
        LocalDateTime cancelledAt
) {

    public static PaymentResult from(
            Payment payment
    ) {
        return new PaymentResult(
                payment.getId(),
                payment.getPaymentNumber(),
                payment.getReservationId(),
                payment.getProvider(),
                payment.getMethod(),
                payment.getProviderPaymentId(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getFailureCode(),
                payment.getFailureMessage(),
                payment.getRequestedAt(),
                payment.getApprovedAt(),
                payment.getCancelledAt()
        );
    }
}
