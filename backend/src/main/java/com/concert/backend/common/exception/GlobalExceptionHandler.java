package com.concert.backend.common.exception;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.common.response.ErrorResponse.InvalidParameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.nio.file.AccessDeniedException;
import java.util.Comparator;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * 전역 예외 처리기 (Global Exception Handler)
 * 애플리케이션 전역에서 발생하는 예외를 포착하여 공통 예외 응답(ErrorResponse) 형식으로 반환합니다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String DEFAULT_INVALID_VALUE_MESSAGE = "요청 값이 올바르지 않습니다.";

    /**
     * 비즈니스 로직 중 발생한 사용자 정의 예외(CommonException) 처리
     */
    @ExceptionHandler(CommonException.class)
    public ResponseEntity<ErrorResponse> handleCommonException(CommonException exception,
            HttpServletRequest request) {
        ErrorCode errorCode = exception.getErrorCode();

        log.warn(
                "비즈니스 예외 발생. type={}, status={}, method={}, path={}, message={}",
                errorCode.name(),
                errorCode.status().value(),
                request.getMethod(),
                request.getRequestURI(),
                exception.getMessage()
        );

        return problemResponse(errorCode,
                ErrorResponse.of(errorCode, exception.getMessage(), request)
        );
    }

    /**
     * @Valid 또는 @Validated 검증 실패 시 발생 (Body의 DTO 검증 실패)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        List<InvalidParameter> invalidParameters = exception
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> InvalidParameter.of(
                        error.getField(),
                        error.getDefaultMessage() == null
                                ? DEFAULT_INVALID_VALUE_MESSAGE
                                : error.getDefaultMessage()
                ))
                .distinct()
                .sorted(Comparator.comparing(InvalidParameter::name))
                .toList();

        return validationErrorResponse(CommonErrorCode.INVALID_INPUT_VALUE, request,
                invalidParameters);
    }

    /**
     * 제약조건 위반 예외 처리 (Controller 파라미터 level의 @Validated 검증 실패)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException exception,
            HttpServletRequest request) {
        List<InvalidParameter> invalidParameters = exception
                .getConstraintViolations()
                .stream()
                .map(violation -> InvalidParameter.of(
                        extractParameterName(
                                violation
                                        .getPropertyPath()
                                        .toString()
                        ),
                        violation.getMessage()
                ))
                .distinct()
                .sorted(Comparator.comparing(InvalidParameter::name))
                .toList();

        return validationErrorResponse(CommonErrorCode.INVALID_INPUT_VALUE, request,
                invalidParameters);
    }

    /**
     * 필수 Request Parameter가 누락된 경우 처리 (@RequestParam)
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingRequestParameterException(
            MissingServletRequestParameterException exception,
            HttpServletRequest request) {
        List<InvalidParameter> invalidParameters =
                List.of(InvalidParameter.of(exception.getParameterName(), "필수 요청 파라미터입니다."));

        return validationErrorResponse(CommonErrorCode.MISSING_REQUEST_PARAMETER, request,
                invalidParameters);
    }

    /**
     * 요청 파라미터의 타입 변환이 실패한 경우 처리 (예: String -> Long 실패)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request) {
        List<InvalidParameter> invalidParameters = List.of(
                InvalidParameter.of(exception.getName(), "요청 값의 타입이 올바르지 않습니다."));

        return validationErrorResponse(CommonErrorCode.TYPE_MISMATCH, request, invalidParameters);
    }

    /**
     * Request Body의 JSON 형식이 잘못되었거나 읽을 수 없는 경우 처리
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException exception,
            HttpServletRequest request) {
        log.debug(
                "요청 본문 파싱 실패. method={}, path={}, message={}",
                request.getMethod(),
                request.getRequestURI(),
                exception.getMessage()
        );

        ErrorCode errorCode = CommonErrorCode.INVALID_JSON_FORMAT;

        return problemResponse(errorCode, ErrorResponse.of(errorCode, request));
    }

    /**
     * 지원하지 않는 HTTP 메서드 요청 시 처리 (예: GET 요청에 POST 호출)
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request) {
        ErrorCode errorCode = CommonErrorCode.METHOD_NOT_ALLOWED;

        return problemResponse(errorCode, ErrorResponse.of(errorCode, request));
    }

    /**
     * 요청 자원에 대한 접근 권한이 부족한 경우 처리
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException exception, HttpServletRequest request) {
        log.warn(
                "접근 권한 거부. method={}, path={}",
                request.getMethod(),
                request.getRequestURI()
        );

        ErrorCode errorCode = CommonErrorCode.ACCESS_DENIED;

        return problemResponse(errorCode, ErrorResponse.of(errorCode, request));
    }

    /**
     * DB 데이터 무결성 제약조건 위반 시 처리 (Unique Key, FK 제약 조건 등)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(
            DataIntegrityViolationException exception,
            HttpServletRequest request) {
        log.warn(
                "데이터 무결성 제약 조건 위반. method={}, path={}, message={}",
                request.getMethod(),
                request.getRequestURI(),
                getMostSpecificCauseMessage(exception)
        );

        ErrorCode errorCode = CommonErrorCode.DATA_INTEGRITY_VIOLATION;

        return problemResponse(errorCode, ErrorResponse.of(errorCode, request));
    }


    // =========================================================================
    // Private Helper Methods
    // =========================================================================

    /**
     * 검증 실패 파라미터 목록(invalidParameters)을 포함하는 예외 응답을 생성합니다.
     */
    private ResponseEntity<ErrorResponse> validationErrorResponse(ErrorCode errorCode,
            HttpServletRequest request, List<InvalidParameter> invalidParameters) {
        ErrorResponse response = ErrorResponse.withErrors(errorCode, request, invalidParameters);

        return problemResponse(errorCode, response);
    }

    /**
     * 공통 ResponseEntity 응답 객체를 생성합니다.
     * Content-Type을 'application/problem+json'으로 고정합니다.
     */
    private ResponseEntity<ErrorResponse> problemResponse(ErrorCode errorCode,
            ErrorResponse response) {
        return ResponseEntity
                .status(errorCode.status())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    /**
     * ConstraintViolation의 propertyPath에서 최종 파라미터명만 추출합니다.
     * 예: "methodName.paramName" -> "paramName"
     */
    private String extractParameterName(String propertyPath) {
        int lastDotIndex = propertyPath.lastIndexOf('.');

        if (lastDotIndex < 0) {
            return propertyPath;
        }

        return propertyPath.substring(lastDotIndex + 1);
    }

    /**
     * DataIntegrityViolationException에서 가장 근본적인 예외 원인(Root Cause) 메세지를 추출합니다.
     */
    private String getMostSpecificCauseMessage(DataIntegrityViolationException exception) {
        Throwable cause = exception.getMostSpecificCause();

        if (cause == null || cause.getMessage() == null) {
            return exception.getMessage();
        }

        return cause.getMessage();
    }
}
