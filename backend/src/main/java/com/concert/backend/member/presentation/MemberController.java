package com.concert.backend.member.presentation;

import com.concert.backend.auth.infrastructure.jwt.RefreshTokenCookieProvider;
import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.auth.presentation.response.SignInResponse;
import com.concert.backend.member.application.DeleteMeService;
import com.concert.backend.member.application.SignUpService;
import com.concert.backend.member.application.SocialSignUpService;
import com.concert.backend.member.application.result.SignUpResult;
import com.concert.backend.member.application.result.SocialSignUpResult;
import com.concert.backend.member.presentation.request.SignUpRequest;
import com.concert.backend.member.presentation.request.SocialSignUpRequest;
import com.concert.backend.member.presentation.response.SignUpResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
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
}

