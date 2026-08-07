package com.concert.backend.reservation.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ReservationErrorCode implements ErrorCode {

    RESERVATION_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "예약을 찾을 수 없습니다."
    ),

    RESERVATION_NUMBER_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예약 번호는 필수입니다."
    ),

    MEMBER_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "회원은 필수입니다."
    ),

    PERFORMANCE_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연 회차는 필수입니다."
    ),

    PERFORMANCE_NOT_RESERVABLE(
            HttpStatus.CONFLICT,
            "현재 예약할 수 없는 공연 회차입니다."
    ),

    RESERVATION_SEAT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예약할 좌석이 필요합니다."
    ),

    TOO_MANY_RESERVATION_SEATS(
            HttpStatus.BAD_REQUEST,
            "회원별 최대 예매 가능 매수를 초과했습니다."
    ),

    DUPLICATE_RESERVATION_SEAT(
            HttpStatus.BAD_REQUEST,
            "동일한 좌석을 중복으로 예약할 수 없습니다."
    ),

    PERFORMANCE_SEAT_MISMATCH(
            HttpStatus.BAD_REQUEST,
            "해당 공연 회차의 좌석이 아닙니다."
    ),

    SEAT_NOT_RESERVABLE(
            HttpStatus.CONFLICT,
            "예약 가능한 좌석이 아닙니다."
    ),

    EXPIRES_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예약 만료일시는 필수입니다."
    ),

    INVALID_RESERVATION_STATUS(
            HttpStatus.CONFLICT,
            "현재 예약 상태에서는 요청한 작업을 수행할 수 없습니다."
    ),

    RESERVATION_EXPIRED(
            HttpStatus.CONFLICT,
            "결제 가능한 시간이 만료되었습니다."
    ),

    RESERVATION_NOT_OWNED(
            HttpStatus.FORBIDDEN,
            "본인의 예약만 조회하거나 변경할 수 있습니다."
    ),

    COMPLETED_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예약 완료일시는 필수입니다."
    ),

    CANCELLED_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예약 취소일시는 필수입니다."
    ),

    EXPIRATION_TIME_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예약 만료 처리 기준 시각은 필수입니다."
    ),

    TOTAL_AMOUNT_OVERFLOW(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "예약 총 금액 계산 중 오류가 발생했습니다."
    ),

    RESERVATION_CONFLICT(
            HttpStatus.CONFLICT,
            "좌석 예약이 동시에 처리되었습니다. 좌석 상태를 다시 확인해주세요."
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

