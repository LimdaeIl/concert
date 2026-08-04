package com.concert.backend.common.exception;

import java.util.Objects;
import lombok.Getter;

/**
 * 애플리케이션 공통 비즈니스 예외 클래스
 * <p>
 * 비즈니스 로직 수행 중 발생하는 예외를 정의된 {@link ErrorCode}와 함께 전달합니다.
 */
@Getter
public class CommonException extends RuntimeException {

    private final ErrorCode errorCode;

    /**
     * 기본 에러 메시지를 사용하는 예외를 생성합니다.
     *
     * @param errorCode 비즈니스 에러 코드 (null 불가)
     */
    public CommonException(ErrorCode errorCode) {
        super(requireErrorCode(errorCode).message());
        this.errorCode = errorCode;
    }

    /**
     * 가변 인수를 동적으로 바인딩하는 에러 메시지 기반 예외를 생성합니다.
     *
     * @param errorCode 비즈니스 에러 코드 (null 불가)
     * @param arguments 에러 메시지 포맷팅에 치환될 인자 목록
     */
    public CommonException(ErrorCode errorCode, Object... arguments) {
        super(requireErrorCode(errorCode).format(arguments));
        this.errorCode = errorCode;
    }

    /**
     * ErrorCode가 null인 상태로 예외 객체가 생성되는 것을 방지합니다.
     */
    private static ErrorCode requireErrorCode(ErrorCode errorCode) {
        return Objects.requireNonNull(errorCode, "ErrorCode는 null일 수 없습니다.");
    }
}
