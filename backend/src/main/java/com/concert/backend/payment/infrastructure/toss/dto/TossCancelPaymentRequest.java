package com.concert.backend.payment.infrastructure.toss.dto;

public record TossCancelPaymentRequest(

        Long cancelAmount,

        String cancelReason
) {
}
