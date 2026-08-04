package com.concert.backend.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 애플리케이션 공통 에러 코드 인터페이스
 * <p>
 * 주로 Enum 타입으로 구현하며, HTTP 응답 상태 및 예외 메시지를 정의합니다.
 */
public interface ErrorCode {

    /**
     * 예외에 해당하는 HTTP 상태 코드를 반환합니다.
     */
    HttpStatus status();

    /**
     * 예외 기본 메시지(또는 포맷용 템플릿)를 반환합니다.
     */
    String message();

    /**
     * 에러 코드를 식별하는 고유 이름을 반환합니다.
     * Enum으로 구현된 경우 상수명을 기본 반환하며, 일반 클래스 구현체인 경우 클래스명을 반환합니다.
     */
    default String name() {
        if (this instanceof Enum<?> enumConstant) {
            return enumConstant.name();
        }
        return this.getClass().getSimpleName(); // Enum이 아닐 경우를 위한 폴백(Fallback)
    }

    /**
     * 메시지 템플릿에 가변 인수를 바인딩하여 포맷팅된 메시지를 반환합니다.
     *
     * @param arguments 메시지 포맷팅에 적용할 인자 목록
     * @return 포맷팅된 에러 메시지 (인자가 없으면 기본 메시지 반환)
     */
    default String format(Object... arguments) {
        if (arguments == null || arguments.length == 0) {
            return message();
        }

        return message().formatted(arguments);
    }
}
