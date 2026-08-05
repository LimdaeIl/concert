package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.SendPhoneVerificationResult;
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
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PhoneVerificationServiceTest {

    private static final String RAW_PHONE = "010-1234-5678";
    private static final String NORMALIZED_PHONE = "01012345678";

    private static final String VERIFICATION_CODE = "123456";
    private static final String WRONG_VERIFICATION_CODE = "999999";
    private static final String VERIFICATION_TOKEN = "phone-verification-token";

    private static final long CODE_EXPIRATION_SECONDS = 180L;
    private static final long TOKEN_EXPIRATION_SECONDS = 1800L;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PhoneVerificationRepository phoneVerificationRepository;

    @Mock
    private PhoneVerificationCodeGenerator codeGenerator;

    @Mock
    private PhoneVerificationTokenGenerator tokenGenerator;

    @Mock
    private PhoneVerificationSmsSender smsSender;

    @Mock
    private PhoneNumberNormalizer phoneNumberNormalizer;

    @Mock
    private PhoneVerificationProperties properties;

    private PhoneVerificationService phoneVerificationService;

    @BeforeEach
    void setUp() {
        phoneVerificationService = new PhoneVerificationService(
                memberRepository,
                phoneVerificationRepository,
                codeGenerator,
                tokenGenerator,
                smsSender,
                phoneNumberNormalizer,
                properties
        );
    }

    @Nested
    @DisplayName("휴대전화 인증번호 발송")
    class SendVerificationCode {

        @Test
        @DisplayName("가입되지 않은 휴대전화번호이면 인증번호를 저장하고 SMS를 발송한다.")
        void sendVerificationCode_success() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(codeGenerator.generate())
                    .thenReturn(VERIFICATION_CODE);

            Mockito.when(properties.codeExpirationSeconds())
                    .thenReturn(CODE_EXPIRATION_SECONDS);

            // when
            SendPhoneVerificationResult result =
                    phoneVerificationService.sendVerificationCode(RAW_PHONE);

            // then
            Assertions.assertNotNull(result);

            Mockito.verify(phoneNumberNormalizer)
                    .normalize(RAW_PHONE);

            Mockito.verify(memberRepository)
                    .existsByPhone(NORMALIZED_PHONE);

            Mockito.verify(codeGenerator)
                    .generate();

            Mockito.verify(phoneVerificationRepository)
                    .deleteCode(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .deleteFailedAttempts(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .saveCode(NORMALIZED_PHONE, VERIFICATION_CODE);

            Mockito.verify(smsSender)
                    .send(NORMALIZED_PHONE, VERIFICATION_CODE);
        }

        @Test
        @DisplayName("인증번호를 재발급하면 기존 인증번호와 실패 횟수를 삭제한 후 새 인증번호를 저장한다.")
        void sendVerificationCode_resetsPreviousRequestBeforeSavingNewCode() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(codeGenerator.generate())
                    .thenReturn(VERIFICATION_CODE);

            Mockito.when(properties.codeExpirationSeconds())
                    .thenReturn(CODE_EXPIRATION_SECONDS);

            // when
            phoneVerificationService.sendVerificationCode(RAW_PHONE);

            // then
            InOrder inOrder = Mockito.inOrder(phoneVerificationRepository);

            inOrder.verify(phoneVerificationRepository)
                    .deleteCode(NORMALIZED_PHONE);

            inOrder.verify(phoneVerificationRepository)
                    .deleteFailedAttempts(NORMALIZED_PHONE);

            inOrder.verify(phoneVerificationRepository)
                    .saveCode(NORMALIZED_PHONE, VERIFICATION_CODE);
        }

        @Test
        @DisplayName("이미 가입된 휴대전화번호이면 인증번호를 발급하지 않는다.")
        void sendVerificationCode_registeredPhone() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(true);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.sendVerificationCode(RAW_PHONE)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MEMBER_PHONE_ALREADY_EXISTS,
                    exception.getErrorCode()
            );

            Mockito.verify(memberRepository)
                    .existsByPhone(NORMALIZED_PHONE);

            Mockito.verifyNoInteractions(codeGenerator);
            Mockito.verifyNoInteractions(phoneVerificationRepository);
            Mockito.verifyNoInteractions(smsSender);
        }

        @Test
        @DisplayName("SMS 발송에 실패하면 저장된 인증번호와 실패 횟수를 삭제한다.")
        void sendVerificationCode_smsFailure_cleansVerificationRequest() {
            // given
            AuthException smsException = Mockito.mock(AuthException.class);

            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(codeGenerator.generate())
                    .thenReturn(VERIFICATION_CODE);

            Mockito.doThrow(smsException)
                    .when(smsSender)
                    .send(NORMALIZED_PHONE, VERIFICATION_CODE);

            // when
            AuthException thrownException = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.sendVerificationCode(RAW_PHONE)
            );

            // then
            Assertions.assertSame(smsException, thrownException);

            /*
             * deleteCode와 deleteFailedAttempts는 발송 전 초기화와
             * 발송 실패 후 정리에서 각각 한 번씩 호출된다.
             */
            Mockito.verify(phoneVerificationRepository, Mockito.times(2))
                    .deleteCode(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository, Mockito.times(2))
                    .deleteFailedAttempts(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .saveCode(NORMALIZED_PHONE, VERIFICATION_CODE);
        }

        @Test
        @DisplayName("SMS 발송 실패 후 정리에 실패해도 원래 SMS 발송 예외를 전달한다.")
        void sendVerificationCode_cleanupFailure_doesNotHideSmsException() {
            // given
            AuthException smsException = Mockito.mock(AuthException.class);

            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(codeGenerator.generate())
                    .thenReturn(VERIFICATION_CODE);

            /*
             * 첫 번째 deleteCode 호출은 인증번호 발급 전 초기화이다.
             * 두 번째 호출은 SMS 발송 실패 후 정리이다.
             */
            Mockito.doNothing()
                    .doThrow(new RuntimeException("인증 요청 정리 실패"))
                    .when(phoneVerificationRepository)
                    .deleteCode(NORMALIZED_PHONE);

            Mockito.doThrow(smsException)
                    .when(smsSender)
                    .send(NORMALIZED_PHONE, VERIFICATION_CODE);

            // when
            AuthException thrownException = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.sendVerificationCode(RAW_PHONE)
            );

            // then
            Assertions.assertSame(smsException, thrownException);

            Mockito.verify(phoneVerificationRepository, Mockito.times(2))
                    .deleteCode(NORMALIZED_PHONE);
        }
    }

    @Nested
    @DisplayName("휴대전화 인증번호 검증")
    class VerifyPhone {

        @Test
        @DisplayName("인증번호가 일치하면 인증 토큰을 발급하고 기존 인증 요청을 삭제한다.")
        void verify_success() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(phoneVerificationRepository.findCode(NORMALIZED_PHONE))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(tokenGenerator.generate())
                    .thenReturn(VERIFICATION_TOKEN);

            Mockito.when(properties.tokenExpirationSeconds())
                    .thenReturn(TOKEN_EXPIRATION_SECONDS);

            // when
            VerifyPhoneResult result = phoneVerificationService.verify(
                    RAW_PHONE,
                    VERIFICATION_CODE
            );

            // then
            Assertions.assertNotNull(result);

            Assertions.assertAll(
                    () -> Assertions.assertEquals(
                            NORMALIZED_PHONE,
                            result.phone()
                    ),
                    () -> Assertions.assertEquals(
                            VERIFICATION_TOKEN,
                            result.verificationToken()
                    ),
                    () -> Assertions.assertEquals(
                            TOKEN_EXPIRATION_SECONDS,
                            result.expiresInSeconds()
                    )
            );

            Mockito.verify(memberRepository)
                    .existsByPhone(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .findCode(NORMALIZED_PHONE);

            Mockito.verify(tokenGenerator)
                    .generate();

            Mockito.verify(phoneVerificationRepository)
                    .saveVerificationToken(
                            VERIFICATION_TOKEN,
                            NORMALIZED_PHONE
                    );

            Mockito.verify(phoneVerificationRepository)
                    .deleteCode(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .deleteFailedAttempts(NORMALIZED_PHONE);
        }

        @Test
        @DisplayName("인증번호 발송 후 회원가입된 번호이면 인증 검증을 중단한다.")
        void verify_registeredPhone() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(true);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.verify(
                            RAW_PHONE,
                            VERIFICATION_CODE
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MEMBER_PHONE_ALREADY_EXISTS,
                    exception.getErrorCode()
            );

            Mockito.verifyNoInteractions(phoneVerificationRepository);
            Mockito.verifyNoInteractions(tokenGenerator);
        }

        @Test
        @DisplayName("저장된 인증번호가 없으면 인증번호 만료 예외가 발생한다.")
        void verify_expiredCode() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(phoneVerificationRepository.findCode(NORMALIZED_PHONE))
                    .thenReturn(Optional.empty());

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.verify(
                            RAW_PHONE,
                            VERIFICATION_CODE
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.PHONE_VERIFICATION_CODE_EXPIRED,
                    exception.getErrorCode()
            );

            Mockito.verifyNoInteractions(tokenGenerator);

            Mockito.verify(phoneVerificationRepository, Mockito.never())
                    .saveVerificationToken(
                            Mockito.anyString(),
                            Mockito.anyString()
                    );

            Mockito.verify(phoneVerificationRepository, Mockito.never())
                    .deleteCode(NORMALIZED_PHONE);
        }

        @Test
        @DisplayName("인증번호가 일치하지 않으면 실패 횟수를 증가시킨다.")
        void verify_codeMismatch_incrementsFailedAttempts() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(phoneVerificationRepository.findCode(NORMALIZED_PHONE))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(
                    phoneVerificationRepository.incrementFailedAttempts(
                            NORMALIZED_PHONE
                    )
            ).thenReturn(1L);

            Mockito.when(properties.maxFailedAttempts())
                    .thenReturn(MAX_FAILED_ATTEMPTS);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.verify(
                            RAW_PHONE,
                            WRONG_VERIFICATION_CODE
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.PHONE_VERIFICATION_CODE_MISMATCH,
                    exception.getErrorCode()
            );

            Mockito.verify(phoneVerificationRepository)
                    .incrementFailedAttempts(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository, Mockito.never())
                    .deleteCode(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository, Mockito.never())
                    .deleteFailedAttempts(NORMALIZED_PHONE);

            Mockito.verifyNoInteractions(tokenGenerator);
        }

        @Test
        @DisplayName("최대 실패 횟수에 도달하면 인증번호와 실패 횟수를 삭제한다.")
        void verify_attemptsExceeded() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(phoneVerificationRepository.findCode(NORMALIZED_PHONE))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(
                    phoneVerificationRepository.incrementFailedAttempts(
                            NORMALIZED_PHONE
                    )
            ).thenReturn(5L);

            Mockito.when(properties.maxFailedAttempts())
                    .thenReturn(MAX_FAILED_ATTEMPTS);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.verify(
                            RAW_PHONE,
                            WRONG_VERIFICATION_CODE
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.PHONE_VERIFICATION_ATTEMPTS_EXCEEDED,
                    exception.getErrorCode()
            );

            Mockito.verify(phoneVerificationRepository)
                    .incrementFailedAttempts(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .deleteCode(NORMALIZED_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .deleteFailedAttempts(NORMALIZED_PHONE);

            Mockito.verifyNoInteractions(tokenGenerator);

            Mockito.verify(phoneVerificationRepository, Mockito.never())
                    .saveVerificationToken(
                            Mockito.anyString(),
                            Mockito.anyString()
                    );
        }

        @Test
        @DisplayName("인증번호가 틀리면 인증 토큰을 발급하지 않는다.")
        void verify_codeMismatch_doesNotIssueToken() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(memberRepository.existsByPhone(NORMALIZED_PHONE))
                    .thenReturn(false);

            Mockito.when(phoneVerificationRepository.findCode(NORMALIZED_PHONE))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(
                    phoneVerificationRepository.incrementFailedAttempts(
                            NORMALIZED_PHONE
                    )
            ).thenReturn(2L);

            Mockito.when(properties.maxFailedAttempts())
                    .thenReturn(MAX_FAILED_ATTEMPTS);

            // when
            Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.verify(
                            RAW_PHONE,
                            WRONG_VERIFICATION_CODE
                    )
            );

            // then
            Mockito.verifyNoInteractions(tokenGenerator);

            Mockito.verify(phoneVerificationRepository, Mockito.never())
                    .saveVerificationToken(
                            Mockito.anyString(),
                            Mockito.anyString()
                    );
        }
    }

    @Nested
    @DisplayName("휴대전화 인증 토큰 검증")
    class ValidateVerificationToken {

        @Test
        @DisplayName("토큰에 저장된 번호와 요청 번호가 일치하면 검증에 성공한다.")
        void validateVerificationToken_success() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(
                    phoneVerificationRepository.findPhoneByVerificationToken(
                            VERIFICATION_TOKEN
                    )
            ).thenReturn(Optional.of(NORMALIZED_PHONE));

            // when
            phoneVerificationService.validateVerificationToken(
                    RAW_PHONE,
                    VERIFICATION_TOKEN
            );

            // then
            Mockito.verify(phoneNumberNormalizer)
                    .normalize(RAW_PHONE);

            Mockito.verify(phoneVerificationRepository)
                    .findPhoneByVerificationToken(VERIFICATION_TOKEN);
        }

        @Test
        @DisplayName("인증 토큰이 존재하지 않으면 유효하지 않은 토큰 예외가 발생한다.")
        void validateVerificationToken_invalidToken() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(
                    phoneVerificationRepository.findPhoneByVerificationToken(
                            VERIFICATION_TOKEN
                    )
            ).thenReturn(Optional.empty());

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.validateVerificationToken(
                            RAW_PHONE,
                            VERIFICATION_TOKEN
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.PHONE_VERIFICATION_TOKEN_INVALID,
                    exception.getErrorCode()
            );
        }

        @Test
        @DisplayName("토큰에 저장된 번호와 요청 번호가 다르면 번호 불일치 예외가 발생한다.")
        void validateVerificationToken_phoneMismatch() {
            // given
            Mockito.when(phoneNumberNormalizer.normalize(RAW_PHONE))
                    .thenReturn(NORMALIZED_PHONE);

            Mockito.when(
                    phoneVerificationRepository.findPhoneByVerificationToken(
                            VERIFICATION_TOKEN
                    )
            ).thenReturn(Optional.of("01099998888"));

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> phoneVerificationService.validateVerificationToken(
                            RAW_PHONE,
                            VERIFICATION_TOKEN
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.PHONE_VERIFICATION_PHONE_MISMATCH,
                    exception.getErrorCode()
            );
        }
    }

    @Nested
    @DisplayName("휴대전화 인증 토큰 소비")
    class ConsumeVerificationToken {

        @Test
        @DisplayName("인증 토큰을 소비하면 저장소에서 토큰을 삭제한다.")
        void consumeVerificationToken_success() {
            // when
            phoneVerificationService.consumeVerificationToken(
                    VERIFICATION_TOKEN
            );

            // then
            Mockito.verify(phoneVerificationRepository)
                    .deleteVerificationToken(VERIFICATION_TOKEN);
        }
    }
}
