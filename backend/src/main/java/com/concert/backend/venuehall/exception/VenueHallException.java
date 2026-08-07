package com.concert.backend.venuehall.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class VenueHallException extends CommonException {

    public VenueHallException(ErrorCode errorCode) {
        super(errorCode);
    }

    public VenueHallException(
            ErrorCode errorCode,
            Object... arguments
    ) {
        super(errorCode, arguments);
    }

    public VenueHallException(
            ErrorCode errorCode,
            Throwable cause
    ) {
        super(errorCode, cause);
    }

    public VenueHallException(
            ErrorCode errorCode,
            Throwable cause,
            Object... arguments
    ) {
        super(errorCode, cause, arguments);
    }
}
