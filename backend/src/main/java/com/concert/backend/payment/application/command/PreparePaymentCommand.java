package com.concert.backend.payment.application.command;

import com.concert.backend.payment.domain.PaymentProvider;

public record PreparePaymentCommand(
        PaymentProvider provider
) {
}
