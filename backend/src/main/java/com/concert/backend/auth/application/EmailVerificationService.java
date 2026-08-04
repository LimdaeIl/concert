package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.VerifyEmailResult;
import com.concert.backend.auth.domain.EmailVerificationCodeGenerator;
import com.concert.backend.auth.domain.EmailVerificationRepository;
import com.concert.backend.auth.domain.EmailVerificationTokenGenerator;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.mail.EmailVerificationMailSender;
import com.concert.backend.member.domain.MemberRepository;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long VERIFICATION_TOKEN_EXPIRES_IN_SECONDS = 30 * 60L;
    private final MemberRepository memberRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailVerificationCodeGenerator codeGenerator;
    private final EmailVerificationTokenGenerator tokenGenerator;
    private final EmailVerificationMailSender mailSender;

    public void sendVerificationCode(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        validateEmailNotRegistered(email);
        String verificationCode = codeGenerator.generate();

        // 새로운 인증번호를 발급하면 이전 실패 횟수는 초기화
        emailVerificationRepository.deleteFailedAttempts(email);
        emailVerificationRepository.saveCode(email, verificationCode);

        try {
            mailSender.send(email, verificationCode);
        } catch (AuthException exception) {
            deleteVerificationRequestQuietly(email);
            throw exception;
        }
    }

    public VerifyEmailResult verify(String rawEmail, String verificationCode) {
        String email = normalizeEmail(rawEmail);

        String savedCode = emailVerificationRepository.findCode(email)
                .orElseThrow(() -> new AuthException(AuthErrorCode.EMAIL_VERIFICATION_CODE_EXPIRED));

        if (!savedCode.equals(verificationCode)) {
            handleVerificationFailure(email);
        }

        String verificationToken = tokenGenerator.generate();

        emailVerificationRepository.saveVerificationToken(verificationToken, email);

        emailVerificationRepository.deleteCode(email);
        emailVerificationRepository.deleteFailedAttempts(email);

        return VerifyEmailResult.of(email, verificationToken, VERIFICATION_TOKEN_EXPIRES_IN_SECONDS);
    }

    public void validateVerificationToken(String rawEmail, String verificationToken) {
        String email = normalizeEmail(rawEmail);

        String verifiedEmail = emailVerificationRepository
                .findEmailByVerificationToken(verificationToken)
                .orElseThrow(() -> new AuthException(AuthErrorCode.EMAIL_VERIFICATION_TOKEN_INVALID));

        if (!verifiedEmail.equals(email)) {
            throw new AuthException(AuthErrorCode.EMAIL_VERIFICATION_EMAIL_MISMATCH);
        }
    }

    public void consumeVerificationToken(String verificationToken) {
        emailVerificationRepository.deleteVerificationToken(verificationToken);
    }

    private void handleVerificationFailure(String email) {
        long failedAttempts = emailVerificationRepository.incrementFailedAttempts(email);

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            emailVerificationRepository.deleteCode(email);
            emailVerificationRepository.deleteFailedAttempts(email);

            throw new AuthException(AuthErrorCode.EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED);
        }

        throw new AuthException(AuthErrorCode.EMAIL_VERIFICATION_CODE_MISMATCH);
    }

    private void validateEmailNotRegistered(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new AuthException(AuthErrorCode.DUPLICATE_EMAIL, email);
        }
    }

    private void deleteVerificationRequestQuietly(String email) {
        try {
            emailVerificationRepository.deleteCode(email);
            emailVerificationRepository.deleteFailedAttempts(email);
        } catch (RuntimeException exception) {
            log.warn(
                    "메일 발송 실패 후 이메일 인증 요청 정리에 실패했습니다. email={}",
                    email,
                    exception
            );
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
