package com.concert.backend.venuehall.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class SeatException extends CommonException {

    public SeatException(ErrorCode errorCode) {
        super(errorCode);
    }

    public SeatException(
            ErrorCode errorCode,
            Object... arguments
    ) {
        super(errorCode, arguments);
    }

    public SeatException(
            ErrorCode errorCode,
            Throwable cause
    ) {
        super(errorCode, cause);
    }

    public SeatException(
            ErrorCode errorCode,
            Throwable cause,
            Object... arguments
    ) {
        super(errorCode, cause, arguments);
    }
}
