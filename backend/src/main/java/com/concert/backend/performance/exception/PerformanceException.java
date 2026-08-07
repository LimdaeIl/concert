package com.concert.backend.performance.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class PerformanceException extends CommonException {

    public PerformanceException(ErrorCode errorCode) {
        super(errorCode);
    }

    public PerformanceException(ErrorCode errorCode, Object... arguments) {
        super(errorCode, arguments);
    }

    public PerformanceException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public PerformanceException(ErrorCode errorCode, Throwable cause, Object... arguments) {
        super(errorCode, cause, arguments);
    }
}
