package com.concert.backend.performance.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PerformanceErrorCode implements ErrorCode {

    PERFORMANCE_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "공연 회차를 찾을 수 없습니다."
    ),

    VENUE_HALL_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연홀은 필수입니다."
    ),

    STARTS_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연 시작일시는 필수입니다."
    ),

    ENDS_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연 종료일시는 필수입니다."
    ),

    RESERVATION_OPENS_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예매 시작일시는 필수입니다."
    ),

    RESERVATION_CLOSES_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예매 종료일시는 필수입니다."
    ),

    INVALID_PERFORMANCE_PERIOD(
            HttpStatus.BAD_REQUEST,
            "공연 종료일시는 시작일시보다 이후여야 합니다."
    ),

    INVALID_RESERVATION_PERIOD(
            HttpStatus.BAD_REQUEST,
            "예매 종료일시는 예매 시작일시보다 이후여야 합니다."
    ),

    INVALID_RESERVATION_CLOSE_TIME(
            HttpStatus.BAD_REQUEST,
            "예매 종료일시는 공연 시작일시보다 이후일 수 없습니다."
    ),

    INVALID_MAX_TICKETS_PER_MEMBER(
            HttpStatus.BAD_REQUEST,
            "회원별 최대 예매 매수는 1매 이상이어야 합니다."
    ),

    PERFORMANCE_STATUS_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연 회차 상태는 필수입니다."
    ),

    SAME_PERFORMANCE_STATUS(
            HttpStatus.BAD_REQUEST,
            "현재 공연 회차 상태와 동일합니다."
    ),

    INVALID_PERFORMANCE_STATUS_TRANSITION(
            HttpStatus.CONFLICT,
            "현재 공연 회차 상태에서는 요청한 상태로 변경할 수 없습니다."
    ),

    PERFORMANCE_NOT_EDITABLE(
            HttpStatus.CONFLICT,
            "현재 상태의 공연 회차는 수정할 수 없습니다."
    ),

    CONCERT_NOT_AVAILABLE(
            HttpStatus.CONFLICT,
            "공개된 공연에만 공연 회차를 등록할 수 있습니다."
    ),

    VENUE_HALL_NOT_AVAILABLE(
            HttpStatus.CONFLICT,
            "사용 가능한 공연홀에만 공연 회차를 등록할 수 있습니다."
    ),

    PERFORMANCE_TIME_CONFLICT(
            HttpStatus.CONFLICT,
            "해당 공연홀에 시간이 겹치는 공연 회차가 존재합니다."
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
