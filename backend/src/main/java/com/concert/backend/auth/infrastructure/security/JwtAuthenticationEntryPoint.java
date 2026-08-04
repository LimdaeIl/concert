package com.concert.backend.auth.infrastructure.security;

import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.common.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final JsonMapper jsonMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        /*
         * AuthenticationEntryPoint는 토큰이 없거나 인증 객체가 만들어지지 않은
         * 일반적인 미인증 요청에도 호출됩니다.
         *
         * 따라서 모든 상황을 INVALID_ACCESS_TOKEN으로 처리하면
         * 토큰을 제출하지 않은 요청까지 "유효하지 않은 토큰"으로 표현됩니다.
         */
        AuthErrorCode errorCode = AuthErrorCode.UNAUTHORIZED;

        ErrorResponse errorResponse = ErrorResponse.of(
                errorCode,
                request
        );

        response.setStatus(errorCode.status().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);

        jsonMapper.writeValue(
                response.getWriter(),
                errorResponse
        );
    }
}
