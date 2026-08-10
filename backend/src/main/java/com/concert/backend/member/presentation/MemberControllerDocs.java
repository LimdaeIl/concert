package com.concert.backend.member.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.auth.presentation.response.SignInResponse;
import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.member.application.result.UpdatePhoneRequest;
import com.concert.backend.member.presentation.request.CreateProfileImageUploadUrlRequest;
import com.concert.backend.member.presentation.request.SignUpRequest;
import com.concert.backend.member.presentation.request.SocialSignUpRequest;
import com.concert.backend.member.presentation.request.UpdateEmailRequest;
import com.concert.backend.member.presentation.request.UpdateMeRequest;
import com.concert.backend.member.presentation.request.UpdatePasswordRequest;
import com.concert.backend.member.presentation.request.UpdateProfileImageRequest;
import com.concert.backend.member.presentation.response.GetMeResponse;
import com.concert.backend.member.presentation.response.ProfileImageUploadUrlResponse;
import com.concert.backend.member.presentation.response.SignUpResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

    @Operation(
            summary = "내 정보 조회",
            description = "현재 로그인한 회원의 기본 정보와 연결된 소셜 제공자를 조회합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "내 정보 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = GetMeResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 유효하지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetMeResponse> getMe(
            @Parameter(hidden = true)
            @AuthenticationPrincipal LoginMember loginMember
    );

    @Operation(
            summary = "내 프로필 수정",
            description = "현재 로그인한 회원의 이름과 주소를 수정합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "프로필 수정 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = GetMeResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "입력값 오류",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 유효하지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetMeResponse> updateMe(
            @Parameter(hidden = true)
            @AuthenticationPrincipal LoginMember loginMember,

            @Valid @RequestBody UpdateMeRequest request
    );

    @Operation(
            summary = "비밀번호 변경",
            description = """
                현재 비밀번호를 검증한 뒤 새 비밀번호로 변경합니다.
                변경 성공 시 기존 Refresh Token이 폐기되므로 다시 로그인해야 합니다.
                소셜 로그인 전용 회원은 사용할 수 없습니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "비밀번호 변경 성공"
    )
    @ApiResponse(
            responseCode = "400",
            description = """
                현재 비밀번호 불일치, 동일한 새 비밀번호,
                소셜 전용 회원 또는 비밀번호 정책 위반
                """,
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 Access Token이 유효하지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<Void> updatePassword(
            @Parameter(hidden = true)
            @AuthenticationPrincipal LoginMember loginMember,

            @Valid @RequestBody UpdatePasswordRequest request,

            @Parameter(hidden = true)
            HttpServletResponse response
    );

    @Operation(
            summary = "이메일 변경",
            description = """
                인증이 완료된 새 이메일로 회원 이메일을 변경합니다.
                변경 성공 시 기존 Refresh Token이 폐기되므로 다시 로그인해야 합니다.
                소셜 제공자가 전달한 provider 이메일은 변경하지 않습니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "이메일 변경 성공"
    )
    @ApiResponse(
            responseCode = "400",
            description = """
                인증 토큰 오류, 중복 이메일,
                현재 이메일과 동일하거나 입력값이 올바르지 않음
                """,
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 Access Token이 유효하지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<Void> updateEmail(
            @Parameter(hidden = true)
            @AuthenticationPrincipal LoginMember loginMember,

            @Valid @RequestBody UpdateEmailRequest request,

            @Parameter(hidden = true)
            HttpServletResponse response
    );

    @Operation(
            summary = "휴대전화번호 변경",
            description = """
                휴대전화 인증이 완료된 새 번호로 회원의 휴대전화번호를 변경합니다.
                변경 성공 시 기존 Refresh Token을 폐기하므로 다시 로그인해야 합니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "휴대전화번호 변경 성공"
    )
    @ApiResponse(
            responseCode = "400",
            description = """
                입력값 오류, 휴대전화 인증 토큰 오류,
                이미 사용 중인 번호 또는 현재 번호와 동일한 경우
                """,
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 Access Token이 유효하지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<Void> updatePhone(
            @Parameter(hidden = true)
            @AuthenticationPrincipal LoginMember loginMember,

            @Valid
            @RequestBody
            UpdatePhoneRequest request,

            @Parameter(hidden = true)
            HttpServletResponse response
    );

    @Operation(
            summary = "프로필 이미지 업로드 URL 발급",
            description = """
                현재 로그인한 회원이 프로필 이미지를
                S3에 직접 업로드할 수 있도록
                일정 시간 동안 유효한 Presigned PUT URL을 발급합니다.

                지원하는 이미지 형식은
                JPEG, PNG, WEBP입니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "프로필 이미지 업로드 URL 발급 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    ProfileImageUploadUrlResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "지원하지 않는 이미지 형식 또는 잘못된 요청",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation =
                                    ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 Access Token이 유효하지 않음"
    )
    ResponseEntity<ProfileImageUploadUrlResponse>
    createProfileImageUploadUrl(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Valid
            @RequestBody
            CreateProfileImageUploadUrlRequest request
    );

    @Operation(
            summary = "프로필 이미지 변경",
            description = """
                S3 업로드가 완료된 프로필 이미지의
                Object Key를 현재 회원의 프로필 이미지로 등록합니다.

                본인에게 발급된 members/{memberId}/profile/
                경로의 Object Key만 등록할 수 있습니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "프로필 이미지 변경 성공"
    )
    @ApiResponse(
            responseCode = "400",
            description = "잘못된 이미지 Object Key"
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 Access Token이 유효하지 않음"
    )
    ResponseEntity<Void> updateProfileImage(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Valid
            @RequestBody
            UpdateProfileImageRequest request
    );

    @Operation(
            summary = "프로필 이미지 삭제",
            description = """
                현재 회원의 프로필 이미지 연결을 제거합니다.
                프로필 이미지를 등록하지 않은 회원도 호출할 수 있습니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "프로필 이미지 삭제 성공"
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 정보가 없거나 Access Token이 유효하지 않음"
    )
    ResponseEntity<Void> deleteProfileImage(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember
    );

}
