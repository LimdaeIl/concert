package com.concert.backend.payment.domain;

import lombok.Getter;

@Getter
public class PaymentGatewayException
        extends RuntimeException {

    private final String code;

    public PaymentGatewayException(
            String code,
            String message
    ) {
        super(message);
        this.code = code;
    }

    public PaymentGatewayException(
            String code,
            String message,
            Throwable cause
    ) {
        super(message, cause);
        this.code = code;
    }
}
