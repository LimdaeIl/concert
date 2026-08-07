package com.concert.backend.payment.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class PaymentException extends CommonException {

    public PaymentException(ErrorCode errorCode) {
        super(errorCode);
    }

    public PaymentException(
            ErrorCode errorCode,
            Object... arguments
    ) {
        super(errorCode, arguments);
    }

    public PaymentException(
            ErrorCode errorCode,
            Throwable cause
    ) {
        super(errorCode, cause);
    }

    public PaymentException(
            ErrorCode errorCode,
            Throwable cause,
            Object... arguments
    ) {
        super(errorCode, cause, arguments);
    }
}
