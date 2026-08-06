package com.concert.backend.member.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.auth.presentation.response.SignInResponse;
import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.member.presentation.request.SignUpRequest;
import com.concert.backend.member.presentation.request.SocialSignUpRequest;
import com.concert.backend.member.presentation.response.SignUpResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(
        name = "Member",
        description = "회원 가입, 소셜 회원가입 및 회원 탈퇴 API"
)
public interface MemberControllerDocs {

    @Operation(
            summary = "일반 회원가입",
            description = "이메일 및 휴대전화 인증을 완료한 사용자가 일반 회원으로 가입합니다."
    )
    @ApiResponse(
            responseCode = "201",
            description = "회원가입 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SignUpResponse.class)
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "입력값 오류, 인증 토큰 오류 또는 중복 회원 정보",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<SignUpResponse> signUp(
            @Valid @RequestBody SignUpRequest request
    );

    @Operation(
            summary = "소셜 회원가입",
            description = """
                    소셜 로그인 후 발급된 SIGNUP 티켓과
                    휴대전화 인증 정보를 이용해 회원가입을 완료합니다.
                    """
    )
    @ApiResponse(
            responseCode = "201",
            description = "소셜 회원가입 및 로그인 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SignInResponse.class)
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "입력값 오류 또는 중복 회원 정보",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "소셜 가입 티켓이 만료되었거나 유효하지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<SignInResponse> socialSignUp(
            @Valid @RequestBody SocialSignUpRequest request,

            @Parameter(hidden = true)
            HttpServletResponse servletResponse
    );

    @Operation(
            summary = "회원 탈퇴",
            description = """
                    회원을 탈퇴 상태로 변경하고 개인정보를 익명화합니다.
                    소셜 계정, Refresh Token 및 미사용 OAuth 로그인 티켓도 삭제합니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "회원 탈퇴 성공"
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보 없음 또는 유효하지 않은 Access Token",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
    ResponseEntity<Void> deleteMe(
            @Parameter(hidden = true)
            @AuthenticationPrincipal LoginMember loginMember,

            @Parameter(hidden = true)
            HttpServletResponse response
    );
}
