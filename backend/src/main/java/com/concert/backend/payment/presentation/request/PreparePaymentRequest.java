package com.concert.backend.payment.presentation.request;

import com.concert.backend.payment.application.command.PreparePaymentCommand;
import com.concert.backend.payment.domain.PaymentProvider;
import jakarta.validation.constraints.NotNull;

public record PreparePaymentRequest(

        @NotNull(message = "결제 제공자는 필수입니다.")
        PaymentProvider provider
) {

    public PreparePaymentCommand toCommand() {
        return new PreparePaymentCommand(
                provider
        );
    }
}
