package com.concert.backend.payment.infrastructure.toss.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record TossCancelPaymentResponse(
        String paymentKey,
        String orderId,
        String status,
        Long totalAmount,
        Long balanceAmount,
        List<TossCancelInfo> cancels
) {

    public record TossCancelInfo(
            Long cancelAmount,
            String cancelReason,
            String transactionKey,
            OffsetDateTime canceledAt,
            String cancelStatus
    ) {
    }
}
