package com.concert.backend.auth.infrastructure.security;

import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.common.exception.ErrorCode;
import com.concert.backend.common.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFailureHandler {

    private final JsonMapper jsonMapper;

    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthException exception
    ) throws IOException {
        ErrorCode errorCode = exception.getErrorCode();

        ErrorResponse errorResponse = ErrorResponse.of(
                errorCode,
                exception.getMessage(),
                request
        );

        response.setStatus(errorCode.status().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(
                MediaType.APPLICATION_PROBLEM_JSON_VALUE
        );

        jsonMapper.writeValue(
                response.getWriter(),
                errorResponse
        );
    }
}
