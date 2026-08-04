package com.concert.backend.member.exception;

import com.concert.backend.common.exception.CommonException;
import com.concert.backend.common.exception.ErrorCode;

public class MemberException extends CommonException {

    public MemberException(ErrorCode errorCode) {
        super(errorCode);
    }

    public MemberException(ErrorCode errorCode, Object... arguments) {
        super(errorCode, arguments);
    }
}

