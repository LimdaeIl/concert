package com.concert.backend.member.presentation;

import com.concert.backend.auth.infrastructure.jwt.RefreshTokenCookieProvider;
import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.auth.presentation.response.SignInResponse;
import com.concert.backend.member.application.DeleteMeService;
import com.concert.backend.member.application.GetMeService;
import com.concert.backend.member.application.SignUpService;
import com.concert.backend.member.application.SocialSignUpService;
import com.concert.backend.member.application.UpdateEmailService;
import com.concert.backend.member.application.UpdateMeService;
import com.concert.backend.member.application.UpdatePasswordService;
import com.concert.backend.member.application.result.GetMeResult;
import com.concert.backend.member.application.result.SignUpResult;
import com.concert.backend.member.application.result.SocialSignUpResult;
import com.concert.backend.member.presentation.request.SignUpRequest;
import com.concert.backend.member.presentation.request.SocialSignUpRequest;
import com.concert.backend.member.presentation.request.UpdateEmailRequest;
import com.concert.backend.member.presentation.request.UpdateMeRequest;
import com.concert.backend.member.presentation.request.UpdatePasswordRequest;
import com.concert.backend.member.presentation.response.GetMeResponse;
import com.concert.backend.member.presentation.response.SignUpResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RequiredArgsConstructor
@RequestMapping("/api/v1/members")
@RestController
public class MemberController implements MemberControllerDocs {

    private final SignUpService signUpService;
    private final SocialSignUpService socialSignUpService;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;
    private final DeleteMeService deleteMeService;
    private final GetMeService getMeService;
    private final UpdateMeService updateMeService;
    private final UpdatePasswordService updatePasswordService;
    private final UpdateEmailService updateEmailService;

    @PostMapping("/sign-up")
    public ResponseEntity<SignUpResponse> signUp(
            @RequestBody @Valid SignUpRequest request
    ) {
        SignUpResult result = signUpService.signUp(request.toCommand());
        SignUpResponse response = SignUpResponse.from(result);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/social-sign-up")
    public ResponseEntity<SignInResponse> socialSignUp(
            @RequestBody @Valid SocialSignUpRequest request,
            HttpServletResponse servletResponse
    ) {
        SocialSignUpResult result =
                socialSignUpService.signUp(request.toCommand());

        refreshTokenCookieProvider.addRefreshTokenCookie(
                servletResponse,
                result.refreshToken(),
                result.refreshTokenRemainingSecond()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        SignInResponse.of(
                                result.memberId(),
                                result.accessToken()
                        )
                );
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(
            @AuthenticationPrincipal LoginMember loginMember,
            HttpServletResponse response
    ) {
        deleteMeService.deleteMe(loginMember.memberId());

        refreshTokenCookieProvider.removeRefreshTokenCookie(response);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<GetMeResponse> getMe(
            @AuthenticationPrincipal LoginMember loginMember
    ) {
        GetMeResult result = getMeService.getMe(loginMember.memberId());

        return ResponseEntity.ok(GetMeResponse.from(result));
    }

    @PatchMapping("/me")
    public ResponseEntity<GetMeResponse> updateMe(
            @AuthenticationPrincipal LoginMember loginMember,
            @RequestBody @Valid UpdateMeRequest request
    ) {
        GetMeResult result =
                updateMeService.updateMe(loginMember.memberId(), request.toCommand());

        return ResponseEntity.ok(GetMeResponse.from(result));
    }

    @Override
    @PatchMapping("/me/password")
    public ResponseEntity<Void> updatePassword(
            @AuthenticationPrincipal LoginMember loginMember,
            @RequestBody @Valid UpdatePasswordRequest request,
            HttpServletResponse response
    ) {
        updatePasswordService.updatePassword(
                loginMember.memberId(),
                request.toCommand()
        );

        refreshTokenCookieProvider.removeRefreshTokenCookie(response);

        return ResponseEntity.noContent().build();
    }

    @Override
    @PatchMapping("/me/email")
    public ResponseEntity<Void> updateEmail(
            @AuthenticationPrincipal LoginMember loginMember,
            @RequestBody @Valid UpdateEmailRequest request,
            HttpServletResponse response
    ) {
        updateEmailService.updateEmail(
                loginMember.memberId(),
                request.toCommand()
        );

        refreshTokenCookieProvider.removeRefreshTokenCookie(response);

        return ResponseEntity.noContent().build();
    }
}

