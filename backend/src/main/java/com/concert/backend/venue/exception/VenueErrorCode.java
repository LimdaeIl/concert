package com.concert.backend.venue.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum VenueErrorCode implements ErrorCode {

    VENUE_NOT_FOUND(HttpStatus.NOT_FOUND, "공연장을 찾을 수 없습니다."),
    DUPLICATE_VENUE(HttpStatus.CONFLICT, "동일한 이름과 주소의 공연장이 이미 존재합니다."),
    VENUE_NAME_REQUIRED(HttpStatus.BAD_REQUEST, "공연장 이름은 필수입니다."),
    VENUE_PHONE_REQUIRED(HttpStatus.BAD_REQUEST, "공연장 전화번호는 필수입니다."),
    VENUE_ADDRESS_REQUIRED(HttpStatus.BAD_REQUEST, "공연장 주소는 필수입니다."),
    VENUE_STATUS_REQUIRED(HttpStatus.BAD_REQUEST, "공연장 상태는 필수입니다."),
    SAME_VENUE_STATUS(HttpStatus.BAD_REQUEST, "현재 공연장 상태와 동일합니다.");

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