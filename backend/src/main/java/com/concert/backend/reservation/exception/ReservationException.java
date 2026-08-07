package com.concert.backend.reservation.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class ReservationException  extends CommonException {

    public ReservationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ReservationException(ErrorCode errorCode, Object... arguments) {
        super(errorCode, arguments);
    }

    public ReservationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public ReservationException(ErrorCode errorCode, Throwable cause, Object... arguments) {
        super(errorCode, cause, arguments);
    }
}
