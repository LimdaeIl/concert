package com.concert.backend.venue.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class VenueException  extends CommonException {

    public VenueException(ErrorCode errorCode) {
        super(errorCode);
    }

    public VenueException(ErrorCode errorCode, Object... arguments) {
        super(errorCode, arguments);
    }

    public VenueException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public VenueException(ErrorCode errorCode, Throwable cause, Object... arguments) {
        super(errorCode, cause, arguments);
    }
}
