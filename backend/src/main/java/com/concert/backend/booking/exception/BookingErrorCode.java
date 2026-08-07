package com.concert.backend.booking.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BookingErrorCode implements ErrorCode {

    INVALID_SEARCH_PERIOD(
            HttpStatus.BAD_REQUEST,
            "조회 시작일은 종료일보다 이후일 수 없습니다."
    ),

    INVALID_PAGE(
            HttpStatus.BAD_REQUEST,
            "페이지 번호가 올바르지 않습니다."
    ),

    INVALID_PAGE_SIZE(
            HttpStatus.BAD_REQUEST,
            "페이지 크기가 올바르지 않습니다."
    );

    private final HttpStatus status;
    private final String message;

    @Override
    public HttpStatus status() {
        return status;
    }

    @Override
    public String message() {
        return message;
    }
}
