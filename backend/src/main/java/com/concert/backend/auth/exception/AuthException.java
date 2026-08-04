package com.concert.backend.auth.exception;

import com.concert.backend.common.exception.CommonException;

public class AuthException extends CommonException {

    public AuthException(AuthErrorCode errorCode) {
        super(errorCode);
    }

    public AuthException(AuthErrorCode errorCode, Object... arguments) {
        super(errorCode, arguments);
    }

    public AuthException(AuthErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public AuthException(AuthErrorCode errorCode, Throwable cause, Object... arguments) {
        super(errorCode, cause, arguments);
    }
}
