package com.concert.backend.payment.presentation.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record CancelPaymentRequest(
        @NotBlank(
                message = "취소 사유는 필수입니다."
        )
        @Size(max = 500)
        String reason,

        Map<String, String> providerData
) {
}
