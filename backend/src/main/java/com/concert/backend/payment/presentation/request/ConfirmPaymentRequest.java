package com.concert.backend.payment.presentation.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record ConfirmPaymentRequest(

        @NotNull
        Long amount,

        @NotEmpty
        Map<String, String> providerData
) {
}
