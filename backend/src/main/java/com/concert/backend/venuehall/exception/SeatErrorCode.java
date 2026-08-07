package com.concert.backend.venuehall.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SeatErrorCode implements ErrorCode {

    SEAT_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "좌석을 찾을 수 없습니다."
    ),

    DUPLICATE_SEAT_POSITION(
            HttpStatus.CONFLICT,
            "동일한 위치의 좌석이 이미 존재합니다."
    ),

    SEAT_SECTION_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "좌석 구역은 필수입니다."
    ),

    SEAT_FLOOR_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "좌석 층은 필수입니다."
    ),

    INVALID_SEAT_FLOOR(
            HttpStatus.BAD_REQUEST,
            "좌석 층은 1 이상이어야 합니다."
    ),

    SEAT_ROW_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "좌석 열은 필수입니다."
    ),

    SEAT_NUMBER_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "좌석 번호는 필수입니다."
    ),

    SEAT_TYPE_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "좌석 유형은 필수입니다."
    ),

    SEAT_STATUS_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "좌석 상태는 필수입니다."
    ),

    SAME_SEAT_STATUS(
            HttpStatus.BAD_REQUEST,
            "현재 좌석 상태와 동일합니다."
    ),

    VENUE_HALL_NOT_AVAILABLE_FOR_SEAT(
            HttpStatus.BAD_REQUEST,
            "사용할 수 없는 공연홀에는 좌석을 등록할 수 없습니다."
    ),

    VENUE_HALL_CAPACITY_EXCEEDED(
            HttpStatus.BAD_REQUEST,
            "공연홀의 최대 수용 인원을 초과할 수 없습니다."
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
