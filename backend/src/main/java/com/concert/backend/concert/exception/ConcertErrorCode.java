package com.concert.backend.concert.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ConcertErrorCode implements ErrorCode {

    CONCERT_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "공연을 찾을 수 없습니다."
    ),

    CONCERT_TITLE_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연 제목은 필수입니다."
    ),

    CONCERT_CATEGORY_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연 카테고리는 필수입니다."
    ),

    CONCERT_AGE_RATING_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "관람 등급은 필수입니다."
    ),

    INVALID_RUNNING_TIME(
            HttpStatus.BAD_REQUEST,
            "공연 시간은 1분 이상이어야 합니다."
    ),

    CONCERT_STATUS_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "공연 상태는 필수입니다."
    ),

    SAME_CONCERT_STATUS(
            HttpStatus.BAD_REQUEST,
            "현재 공연 상태와 동일합니다."
    ),

    INVALID_CONCERT_STATUS_TRANSITION(
            HttpStatus.CONFLICT,
            "현재 공연 상태에서는 요청한 상태로 변경할 수 없습니다."
    ),

    CONCERT_NOT_EDITABLE(
            HttpStatus.CONFLICT,
            "현재 상태의 공연은 정보를 수정할 수 없습니다."
    ), CONCERT_POSTER_KEY_REQUIRED(HttpStatus.BAD_REQUEST, "포스터 키는 필수입니다."), INVALID_CONCERT_POSTER_KEY(
            HttpStatus.BAD_REQUEST,
            "유효하지 않은 포스터 키입니다."
    ), CONCERT_POSTER_NOT_FOUND(HttpStatus.NOT_FOUND, "포스터를 찾을 수 없습니다.");


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
