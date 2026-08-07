package com.concert.backend.payment.presentation.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record AdminRefundPaymentRequest(

        @NotBlank(
                message = "환불 사유는 필수입니다."
        )
        @Size(
                max = 500,
                message = "환불 사유는 최대 500자입니다."
        )
        String reason,

        Map<String, String> providerData
) {
}
