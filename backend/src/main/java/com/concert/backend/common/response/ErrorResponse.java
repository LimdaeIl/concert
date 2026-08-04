package com.concert.backend.common.response;

import com.concert.backend.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

/**
 * RFC 9457 (Problem Details for HTTP APIs) 표준 규격을 준수하는 공통 에러 응답 객체
 *
 * @param type              에러 타입을 식별하는 URI 참조 (기본값: "about:blank")
 * @param title             에러의 비즈니스적 요약 코드명 (예: INVALID_INPUT_VALUE)
 * @param status            HTTP 상태 코드
 * @param detail            발생한 에러에 대한 구체적인 상세 설명
 * @param instance          에러가 발생한 요청 엔드포인트 URI 경로
 * @param timestamp         에러 발생 일시
 * @param invalidParameters (확장) 요청 파라미터 유효성 검증 실패 목록
 */
public record ErrorResponse(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        LocalDateTime timestamp,
        List<InvalidParameter> invalidParameters
) {

    /**
     * 상세 설명(detail)을 직접 지정하여 에러 응답 객체를 생성합니다.
     *
     * @param errorCode 에러 코드 정보
     * @param detail    에러 상세 메시지
     * @param request   현재 HTTP 요청 객체
     */
    public static ErrorResponse of(ErrorCode errorCode, String detail, HttpServletRequest request) {
        return new ErrorResponse(
                "about:blank",
                errorCode.name(),
                errorCode.status().value(),
                detail,
                request.getRequestURI(),
                LocalDateTime.now(),
                List.of()
        );
    }

    /**
     * ErrorCode에 정의된 기본 메시지를 사용하여 에러 응답 객체를 생성합니다.
     *
     * @param errorCode 에러 코드 정보
     * @param request   현재 HTTP 요청 객체
     */
    public static ErrorResponse of(ErrorCode errorCode, HttpServletRequest request) {
        return of(errorCode, errorCode.message(), request);
    }

    /**
     * 유효성 검증(Validation) 실패 파라미터 목록을 포함하는 에러 응답 객체를 생성합니다.
     *
     * @param errorCode         에러 코드 정보
     * @param request           현재 HTTP 요청 객체
     * @param invalidParameters 유효성 검증 실패 파라미터 목록
     */
    public static ErrorResponse withErrors(ErrorCode errorCode, HttpServletRequest request,
            List<InvalidParameter> invalidParameters) {
        return new ErrorResponse(
                "about:blank",
                errorCode.name(),
                errorCode.status().value(),
                errorCode.message(),
                request.getRequestURI(),
                LocalDateTime.now(),
                invalidParameters
        );
    }

    /**
     * RFC 9457 확장 규격: 유효성 검증에 실패한 필드별 에러 정보
     *
     * @param name   검증 실패 필드/파라미터명
     * @param reason 검증 실패 사유
     */
    public record InvalidParameter(
            String name,
            String reason
    ) {

        /**
         * InvalidParameter 객체를 생성합니다.
         */
        public static InvalidParameter of(String name, String reason) {
            return new InvalidParameter(name, reason);
        }
    }
}
