package com.concert.backend.auth.presentation;

import com.concert.backend.auth.application.EmailVerificationService;
import com.concert.backend.auth.application.OAuth2ExchangeService;
import com.concert.backend.auth.application.PhoneVerificationService;
import com.concert.backend.auth.application.SignInService;
import com.concert.backend.auth.application.SignOutService;
import com.concert.backend.auth.application.result.ReissueTokenResult;
import com.concert.backend.auth.application.result.SendPhoneVerificationResult;
import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.application.result.VerifyEmailResult;
import com.concert.backend.auth.application.result.VerifyPhoneResult;
import com.concert.backend.auth.application.ReissueTokenService;
import com.concert.backend.auth.infrastructure.jwt.RefreshTokenCookieProvider;
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
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@RestController
public class AuthController {

    private final EmailVerificationService emailVerificationService;
    private final PhoneVerificationService phoneVerificationService;
    private final SignInService signInService;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;
    private final ReissueTokenService reissueTokenService;
    private final SignOutService signOutService;
    private final OAuth2ExchangeService oauth2ExchangeService;

    @PostMapping("/email-verifications")
    public ResponseEntity<SendEmailVerificationResponse>
    sendEmailVerification(
            @Valid @RequestBody SendEmailVerificationRequest request
    ) {
        emailVerificationService.sendVerificationCode(request.email());

        return ResponseEntity.ok(SendEmailVerificationResponse.of(request.email()));
    }

    @PostMapping("/email-verifications/verify")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {
        VerifyEmailResult result = emailVerificationService.verify(request.email(),
                request.verificationCode());

        return ResponseEntity.ok(VerifyEmailResponse.from(result));
    }

    @PostMapping("/phone-verifications")
    public ResponseEntity<SendPhoneVerificationResponse> sendPhoneVerification(
            @Valid @RequestBody SendPhoneVerificationRequest request
    ) {
        SendPhoneVerificationResult result = phoneVerificationService.sendVerificationCode(
                request.phone());

        return ResponseEntity.ok(
                SendPhoneVerificationResponse.of(result.phone(), result.expiresInSeconds()));
    }

    @PostMapping("/phone-verifications/verify")
    public ResponseEntity<VerifyPhoneResponse> verifyPhone(
            @Valid @RequestBody VerifyPhoneRequest request
    ) {
        VerifyPhoneResult result = phoneVerificationService.verify(request.phone(),
                request.verificationCode());

        return ResponseEntity.ok(VerifyPhoneResponse.from(result));
    }

    @PostMapping("/sign-in")
    public ResponseEntity<SignInResponse> signIn(
            @Valid @RequestBody SignInRequest request,
            HttpServletResponse servletResponse
    ) {
        SignInResult result = signInService.signIn(request.toCommand());
        refreshTokenCookieProvider.addRefreshTokenCookie(
                servletResponse,
                result.refreshToken(),
                result.refreshTokenRemainingSecond()
        );
        return ResponseEntity.ok(SignInResponse.of(result.id(), result.accessToken()));
    }

    @PostMapping("/reissue")
    public ResponseEntity<ReissueResponse> reissue(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse servletResponse
    ) {
        ReissueTokenResult result = reissueTokenService.reissue(refreshToken);

        refreshTokenCookieProvider.addRefreshTokenCookie(
                servletResponse,
                result.refreshToken(),
                result.remainingSecondByRefreshToken()
        );

        return ResponseEntity.ok(ReissueResponse.of(result.id(), result.accessToken()));
    }

    @PostMapping("/sign-out")
    public ResponseEntity<Void> signOut(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        signOutService.signOut(refreshToken);
        refreshTokenCookieProvider.removeRefreshTokenCookie(response);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/oauth/exchange")
    public ResponseEntity<SignInResponse> exchangeOAuth2LoginCode(
            @Valid @RequestBody OAuth2ExchangeRequest request,
            HttpServletResponse servletResponse
    ) {
        SignInResult result =
                oauth2ExchangeService.exchange(request.code());

        refreshTokenCookieProvider.addRefreshTokenCookie(
                servletResponse,
                result.refreshToken(),
                result.refreshTokenRemainingSecond()
        );

        return ResponseEntity.ok(
                SignInResponse.of(
                        result.id(),
                        result.accessToken()
                )
        );
    }
}

