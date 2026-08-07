package com.concert.backend.booking.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class BookingException extends CommonException {

    public BookingException(
            ErrorCode errorCode
    ) {
        super(errorCode);
    }

    public BookingException(
            ErrorCode errorCode,
            Object... arguments
    ) {
        super(errorCode, arguments);
    }

    public BookingException(
            ErrorCode errorCode,
            Throwable cause
    ) {
        super(errorCode, cause);
    }

    public BookingException(
            ErrorCode errorCode,
            Throwable cause,
            Object... arguments
    ) {
        super(errorCode, cause, arguments);
    }
}
