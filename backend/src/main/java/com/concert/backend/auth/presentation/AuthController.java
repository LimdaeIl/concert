package com.concert.backend.auth.presentation;

import com.concert.backend.auth.application.EmailVerificationService;
import com.concert.backend.auth.application.result.VerifyEmailResult;
import com.concert.backend.auth.presentation.request.SendEmailVerificationRequest;
import com.concert.backend.auth.presentation.request.VerifyEmailRequest;
import com.concert.backend.auth.presentation.response.SendEmailVerificationResponse;
import com.concert.backend.auth.presentation.response.VerifyEmailResponse;
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

    @PostMapping("/email-verifications")
    public ResponseEntity<SendEmailVerificationResponse> sendEmailVerification(
            @Valid @RequestBody SendEmailVerificationRequest request
    ) {
        emailVerificationService.sendVerificationCode(request.email());

        return ResponseEntity.ok(
                SendEmailVerificationResponse.of(request.email())
        );
    }

    @PostMapping("/email-verifications/verify")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(
            @Valid
            @RequestBody
            VerifyEmailRequest request
    ) {
        VerifyEmailResult result =
                emailVerificationService.verify(
                        request.email(),
                        request.verificationCode()
                );

        return ResponseEntity.ok(
                VerifyEmailResponse.from(result)
        );
    }
}
