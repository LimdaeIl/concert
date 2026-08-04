package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.VerifyPhoneResult;
import com.concert.backend.auth.domain.PhoneNumberNormalizer;
import com.concert.backend.auth.domain.PhoneVerificationCodeGenerator;
import com.concert.backend.auth.domain.PhoneVerificationRepository;
import com.concert.backend.auth.domain.PhoneVerificationSmsSender;
import com.concert.backend.auth.domain.PhoneVerificationTokenGenerator;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.redis.PhoneVerificationProperties;
import com.concert.backend.member.domain.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhoneVerificationService {

    private final MemberRepository memberRepository;
    private final PhoneVerificationRepository phoneVerificationRepository;
    private final PhoneVerificationCodeGenerator codeGenerator;
    private final PhoneVerificationTokenGenerator tokenGenerator;
    private final PhoneVerificationSmsSender smsSender;
    private final PhoneNumberNormalizer phoneNumberNormalizer;
    private final PhoneVerificationProperties properties;

    public void sendVerificationCode(String rawPhone) {
        String phone = phoneNumberNormalizer.normalize(rawPhone);
        validatePhoneNotRegistered(phone);
        String verificationCode = codeGenerator.generate();

        /*
         * 재요청 시 기존 인증번호와 기존 실패 횟수를 모두 초기화합니다.
         */
        phoneVerificationRepository.deleteCode(phone);
        phoneVerificationRepository.deleteFailedAttempts(phone);
        phoneVerificationRepository.saveCode(phone, verificationCode);

        try {
            smsSender.send(phone, verificationCode);
        } catch (AuthException exception) {
            deleteVerificationRequestQuietly(phone);
            throw exception;
        }
    }

    public VerifyPhoneResult verify(String rawPhone, String verificationCode) {
        String phone = phoneNumberNormalizer.normalize(rawPhone);

        /*
         * 인증번호 발송 이후 회원가입이 완료된 경우를 방어합니다.
         */
        validatePhoneNotRegistered(phone);

        String savedCode = phoneVerificationRepository.findCode(phone)
                .orElseThrow(() -> new AuthException(AuthErrorCode.PHONE_VERIFICATION_CODE_EXPIRED));

        if (!savedCode.equals(verificationCode)) {
            handleVerificationFailure(phone);
        }

        String verificationToken = tokenGenerator.generate();
        phoneVerificationRepository.saveVerificationToken(verificationToken, phone);
        phoneVerificationRepository.deleteCode(phone);
        phoneVerificationRepository.deleteFailedAttempts(phone);

        return VerifyPhoneResult.of(phone, verificationToken, properties.tokenExpirationSeconds());
    }

    public void validateVerificationToken(String rawPhone, String verificationToken) {
        String phone = phoneNumberNormalizer.normalize(rawPhone);

        String verifiedPhone = phoneVerificationRepository
                .findPhoneByVerificationToken(verificationToken)
                .orElseThrow(() -> new AuthException(AuthErrorCode.PHONE_VERIFICATION_TOKEN_INVALID)
                );

        if (!verifiedPhone.equals(phone)) {
            throw new AuthException(AuthErrorCode.PHONE_VERIFICATION_PHONE_MISMATCH);
        }
    }

    public void consumeVerificationToken(String verificationToken) {
        phoneVerificationRepository.deleteVerificationToken(
                verificationToken
        );
    }

    private void handleVerificationFailure(String phone) {
        long failedAttempts =
                phoneVerificationRepository.incrementFailedAttempts(phone);

        if (failedAttempts >= properties.maxFailedAttempts()) {
            /*
             * 다섯 번째 실패 시 기존 인증 요청을 완전히 무효화합니다.
             * 이후에는 인증번호를 다시 발급받아야 합니다.
             */
            phoneVerificationRepository.deleteCode(phone);
            phoneVerificationRepository.deleteFailedAttempts(phone);

            throw new AuthException(
                    AuthErrorCode.PHONE_VERIFICATION_ATTEMPTS_EXCEEDED
            );
        }

        throw new AuthException(
                AuthErrorCode.PHONE_VERIFICATION_CODE_MISMATCH
        );
    }

    private void validatePhoneNotRegistered(String phone) {
        if (memberRepository.existsByPhone(phone)) {
            throw new AuthException(
                    AuthErrorCode.MEMBER_PHONE_ALREADY_EXISTS,
                    phone
            );
        }
    }

    private void deleteVerificationRequestQuietly(String phone) {
        try {
            phoneVerificationRepository.deleteCode(phone);
            phoneVerificationRepository.deleteFailedAttempts(phone);
        } catch (RuntimeException exception) {
            log.warn(
                    "SMS 발송 실패 후 휴대전화 인증 요청 정리에 실패했습니다. phone={}",
                    maskPhone(phone),
                    exception
            );
        }
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return "***";
        }

        return phone.substring(0, 3)
                + "****"
                + phone.substring(phone.length() - 4);
    }
}
