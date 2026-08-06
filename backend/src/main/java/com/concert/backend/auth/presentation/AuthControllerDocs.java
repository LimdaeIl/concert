package com.concert.backend.auth.presentation;

import com.concert.backend.auth.presentation.request.OAuth2ExchangeRequest;
import com.concert.backend.auth.presentation.request.SendEmailVerificationRequest;
import com.concert.backend.auth.presentation.request.SendPhoneVerificationRequest;
import com.concert.backend.auth.presentation.request.SignInRequest;
import com.concert.backend.auth.presentation.request.VerifyEmailRequest;
import com.concert.backend.auth.presentation.request.VerifyPhoneRequest;
import com.concert.backend.auth.presentation.response.ReissueResponse;
import com.concert.backend.auth.presentation.response.SendEmailVerificationResponse;
import com.concert.backend.auth.presentation.response.SendPhoneVerificationResponse;
import com.concert.backend.auth.presentation.response.SignInResponse;
import com.concert.backend.auth.presentation.response.VerifyEmailResponse;
import com.concert.backend.auth.presentation.response.VerifyPhoneResponse;
import com.concert.backend.common.response.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(
        name = "Authentication",
        description = "로그인, 로그아웃, 토큰 재발급 및 본인 인증 API"
)
public interface AuthControllerDocs {

    @Operation(
            summary = "이메일 인증번호 발송",
            description = "회원가입에 사용할 이메일로 인증번호를 발송합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "인증번호 발송 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    SendEmailVerificationResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "잘못된 이메일 또는 이미 가입된 이메일",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<SendEmailVerificationResponse>
    sendEmailVerification(
            @Valid @RequestBody
            SendEmailVerificationRequest request
    );

    @Operation(
            summary = "이메일 인증번호 검증",
            description = "이메일 인증번호를 검증하고 회원가입용 인증 토큰을 발급합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "이메일 인증 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VerifyEmailResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "인증번호 불일치 또는 만료",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<VerifyEmailResponse> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    );

    @Operation(
            summary = "휴대전화 인증번호 발송",
            description = "회원가입에 사용할 휴대전화번호로 인증번호를 발송합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "인증번호 발송 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    SendPhoneVerificationResponse.class
                    )
            )
    )
    ResponseEntity<SendPhoneVerificationResponse>
    sendPhoneVerification(
            @Valid @RequestBody
            SendPhoneVerificationRequest request
    );

    @Operation(
            summary = "휴대전화 인증번호 검증",
            description = "휴대전화 인증번호를 검증하고 회원가입용 인증 토큰을 발급합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "휴대전화 인증 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VerifyPhoneResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "인증번호 불일치, 만료 또는 시도 횟수 초과",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<VerifyPhoneResponse> verifyPhone(
            @Valid @RequestBody VerifyPhoneRequest request
    );

    @Operation(
            summary = "일반 로그인",
            description = "이메일과 비밀번호로 로그인합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "로그인 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = SignInResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "이메일 또는 비밀번호 불일치",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<SignInResponse> signIn(
            @Valid @RequestBody SignInRequest request,

            @Parameter(hidden = true)
            HttpServletResponse servletResponse
    );

    @Operation(
            summary = "소셜 로그인 코드 교환",
            description = """
                    OAuth 로그인 완료 후 발급된 일회용 코드를
                    자체 Access Token과 Refresh Token으로 교환합니다.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "토큰 교환 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = SignInResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "교환 코드가 만료되었거나 이미 사용됨",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<SignInResponse> exchangeOAuth2LoginCode(
            @Valid @RequestBody OAuth2ExchangeRequest request,

            @Parameter(hidden = true)
            HttpServletResponse servletResponse
    );

    @Operation(
            summary = "토큰 재발급",
            description = "Refresh Token 쿠키를 회전하고 새로운 Access Token을 발급합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "토큰 재발급 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = ReissueResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "Refresh Token이 없거나 유효하지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<ReissueResponse> reissue(
            @Parameter(hidden = true)
            @CookieValue(
                    value = "refreshToken",
                    required = false
            )
            String refreshToken,

            @Parameter(hidden = true)
            HttpServletResponse servletResponse
    );

    @Operation(
            summary = "로그아웃",
            description = "서버의 Refresh Token을 삭제하고 쿠키를 만료시킵니다."
    )
    @ApiResponse(
            responseCode = "204",
            description = "로그아웃 성공"
    )
    ResponseEntity<Void> signOut(
            @Parameter(hidden = true)
            @CookieValue(
                    value = "refreshToken",
                    required = false
            )
            String refreshToken,

            @Parameter(hidden = true)
            HttpServletResponse response
    );
}
