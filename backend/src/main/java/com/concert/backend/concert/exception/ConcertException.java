package com.concert.backend.concert.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class ConcertException extends CommonException {

    public ConcertException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ConcertException(
            ErrorCode errorCode,
            Object... arguments
    ) {
        super(errorCode, arguments);
    }

    public ConcertException(
            ErrorCode errorCode,
            Throwable cause
    ) {
        super(errorCode, cause);
    }

    public ConcertException(
            ErrorCode errorCode,
            Throwable cause,
            Object... arguments
    ) {
        super(errorCode, cause, arguments);
    }
}
