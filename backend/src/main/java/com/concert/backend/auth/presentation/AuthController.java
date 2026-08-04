package com.concert.backend.auth.presentation;

import com.concert.backend.auth.application.EmailVerificationService;
import com.concert.backend.auth.application.PhoneVerificationService;
import com.concert.backend.auth.application.result.VerifyEmailResult;
import com.concert.backend.auth.application.result.VerifyPhoneResult;
import com.concert.backend.auth.presentation.request.SendEmailVerificationRequest;
import com.concert.backend.auth.presentation.request.SendPhoneVerificationRequest;
import com.concert.backend.auth.presentation.request.VerifyEmailRequest;
import com.concert.backend.auth.presentation.request.VerifyPhoneRequest;
import com.concert.backend.auth.presentation.response.SendEmailVerificationResponse;
import com.concert.backend.auth.presentation.response.SendPhoneVerificationResponse;
import com.concert.backend.auth.presentation.response.VerifyEmailResponse;
import com.concert.backend.auth.presentation.response.VerifyPhoneResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
        VerifyEmailResult result = emailVerificationService.verify(request.email(), request.verificationCode());

        return ResponseEntity.ok(VerifyEmailResponse.from(result));
    }

    @PostMapping("/phone-verifications")
    public ResponseEntity<SendPhoneVerificationResponse>
    sendPhoneVerification(@Valid @RequestBody SendPhoneVerificationRequest request) {
        phoneVerificationService.sendVerificationCode(request.phone());

        return ResponseEntity.ok(SendPhoneVerificationResponse.of(request.phone()));
    }

    @PostMapping("/phone-verifications/verify")
    public ResponseEntity<VerifyPhoneResponse> verifyPhone(
            @Valid @RequestBody VerifyPhoneRequest request
    ) {
        VerifyPhoneResult result = phoneVerificationService.verify(request.phone(), request.verificationCode());

        return ResponseEntity.ok(VerifyPhoneResponse.from(result));
    }
}
