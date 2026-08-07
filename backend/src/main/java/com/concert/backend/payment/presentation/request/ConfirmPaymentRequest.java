package com.concert.backend.payment.presentation.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.Map;


public record ConfirmPaymentRequest(

        @NotNull(
                message = "결제 금액은 필수입니다."
        )
        @Positive(
                message = "결제 금액은 0원보다 커야 합니다."
        )
        Long amount,

        @NotEmpty(
                message = "결제 제공자 승인 정보가 필요합니다."
        )
        Map<String, String> providerData
) {
}

