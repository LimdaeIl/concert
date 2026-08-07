package com.concert.backend.venuehall.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum VenueHallErrorCode implements ErrorCode {

    VENUE_HALL_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "공연홀을 찾을 수 없습니다."
    ),

    DUPLICATE_VENUE_HALL(
            HttpStatus.CONFLICT,
            "해당 공연장에 동일한 이름의 공연홀이 이미 존재합니다."
    ),

    VENUE_HALL_NAME_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연홀 이름은 필수입니다."
    ),

    VENUE_HALL_CAPACITY_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연홀 수용 인원은 필수입니다."
    ),

    INVALID_VENUE_HALL_CAPACITY(
            HttpStatus.BAD_REQUEST,
            "공연홀 수용 인원은 1명 이상이어야 합니다."
    ),

    VENUE_HALL_STATUS_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연홀 상태는 필수입니다."
    ),

    SAME_VENUE_HALL_STATUS(
            HttpStatus.BAD_REQUEST,
            "현재 공연홀 상태와 동일합니다."
    ),

    VENUE_NOT_AVAILABLE(
            HttpStatus.BAD_REQUEST,
            "사용할 수 없는 공연장에는 공연홀을 등록할 수 없습니다."
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
