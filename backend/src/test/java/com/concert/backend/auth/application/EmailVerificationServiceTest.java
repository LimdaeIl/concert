package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.VerifyEmailResult;
import com.concert.backend.auth.domain.EmailVerificationCodeGenerator;
import com.concert.backend.auth.domain.EmailVerificationRepository;
import com.concert.backend.auth.domain.EmailVerificationTokenGenerator;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.mail.EmailVerificationMailSender;
import com.concert.backend.member.domain.MemberRepository;
import java.util.Optional;
import org.assertj.core.api.AssertionsForClassTypes;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    private static final String RAW_EMAIL = "  MEMBER@EXAMPLE.COM  ";
    private static final String NORMALIZED_EMAIL = "member@example.com";
    private static final String VERIFICATION_CODE = "123456";
    private static final String VERIFICATION_TOKEN = "verification-token";
    private static final long TOKEN_EXPIRES_IN_SECONDS = 30 * 60L;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private EmailVerificationRepository emailVerificationRepository;

    @Mock
    private EmailVerificationCodeGenerator codeGenerator;

    @Mock
    private EmailVerificationTokenGenerator tokenGenerator;

    @Mock
    private EmailVerificationMailSender mailSender;

    @InjectMocks
    private EmailVerificationService emailVerificationService;

    @BeforeEach
    void setUp() {
        emailVerificationService = new EmailVerificationService(
                memberRepository,
                emailVerificationRepository,
                codeGenerator,
                tokenGenerator,
                mailSender
        );
    }

    @Nested
    @DisplayName("이메일 인증번호 발송")
    class SendVerificationCode {

        @Test
        @DisplayName("가입되지 않은 이메일이면 인증번호를 저장하고 메일을 발송한다.")
        void sendVerificationCode_success() {
            // given
            Mockito.when(memberRepository.existsByEmail(NORMALIZED_EMAIL)).thenReturn(false);
            Mockito.when(codeGenerator.generate()).thenReturn(VERIFICATION_CODE);

            // when
            emailVerificationService.sendVerificationCode(RAW_EMAIL);

            // then
            Mockito.verify(memberRepository).existsByEmail(NORMALIZED_EMAIL);
            Mockito.verify(codeGenerator).generate();
            Mockito.verify(emailVerificationRepository).deleteFailedAttempts(NORMALIZED_EMAIL);
            Mockito.verify(emailVerificationRepository)
                    .saveCode(NORMALIZED_EMAIL, VERIFICATION_CODE);
            Mockito.verify(mailSender).send(NORMALIZED_EMAIL, VERIFICATION_CODE);
        }

        @Test
        @DisplayName("새 인증번호를 발급하기 전에 기존 실패 회수를 최기화한다.")
        void sendVerificationCode_resetFailedAttemptBeforeSavingNewCode() {
            // given
            Mockito.when(memberRepository.existsByEmail(NORMALIZED_EMAIL)).thenReturn(false);
            Mockito.when(codeGenerator.generate()).thenReturn(VERIFICATION_CODE);

            // when
            emailVerificationService.sendVerificationCode(RAW_EMAIL);

            // then
            InOrder inOrder = Mockito.inOrder(emailVerificationRepository);

            inOrder.verify(emailVerificationRepository).deleteFailedAttempts(NORMALIZED_EMAIL);
            inOrder.verify(emailVerificationRepository)
                    .saveCode(NORMALIZED_EMAIL, VERIFICATION_CODE);
        }

        @Test
        @DisplayName("이미 가입된 이메일이면 인증번호를 발급하지 않는다.")
        void sendVerificationCode_duplicateEmail() {
            // given
            Mockito.when(memberRepository.existsByEmail(NORMALIZED_EMAIL)).thenReturn(true);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.sendVerificationCode(NORMALIZED_EMAIL));

            // then
            Assertions.assertEquals(AuthErrorCode.DUPLICATE_EMAIL, exception.getErrorCode());
            Mockito.verifyNoInteractions(
                    codeGenerator,
                    emailVerificationRepository,
                    mailSender
            );
        }

        @Test
        @DisplayName("메일 발송에 실패하면 저장한 인증번호와 실패 횟수를 삭제한다.")
        void sendVerificationCode_mailSendFailure_cleansVerificationRequest() {
            // given
            AuthException mailException = new AuthException(AuthErrorCode.EMAIL_SEND_FAILED);

            Mockito.when(memberRepository.existsByEmail(NORMALIZED_EMAIL)).thenReturn(false);

            Mockito.when(codeGenerator.generate()).thenReturn(VERIFICATION_CODE);

            Mockito.doThrow(mailException)
                    .when(mailSender)
                    .send(NORMALIZED_EMAIL, VERIFICATION_CODE);

            // when
            AuthException thrownException = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.sendVerificationCode(RAW_EMAIL)
            );

            // then
            // 1. 객체 주소 대신 비즈니스 에러 코드를 검증
            AssertionsForClassTypes.assertThat(thrownException.getErrorCode())
                    .isEqualTo(AuthErrorCode.EMAIL_SEND_FAILED);

            // 2. 메일 발송 전 1번 + catch 블록에서 1번 = 총 2번 호출
            Mockito.verify(emailVerificationRepository, Mockito.times(2))
                    .deleteFailedAttempts(NORMALIZED_EMAIL);

            // 3. catch 블록에서 저장된 코드 삭제 확인
            Mockito.verify(emailVerificationRepository).deleteCode(NORMALIZED_EMAIL);
        }

        @Test
        @DisplayName("메일 발송 실패 후 정리에도 실패하더라도 원래 메일 발송 예외를 전달한다.")
        void sendVerificationCode_cleanUpFailure_doseNotHideMailException() {
            // given
            AuthException mailException = new AuthException(AuthErrorCode.EMAIL_SEND_FAILED);

            Mockito.when(memberRepository.existsByEmail(NORMALIZED_EMAIL)).thenReturn(false);
            Mockito.when(codeGenerator.generate()).thenReturn(VERIFICATION_CODE);

            // 1차 예외: 메일 발송 실패
            Mockito.doThrow(mailException)
                    .when(mailSender)
                    .send(NORMALIZED_EMAIL, VERIFICATION_CODE);

            // 2차 예외: 정리(Quietly) 로직 실패 (Redis/DB 장애 상황)
            Mockito.doThrow(new RuntimeException("DB/Redis 삭제 실패"))
                    .when(emailVerificationRepository)
                    .deleteCode(NORMALIZED_EMAIL);

            // when
            AuthException thrownException = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.sendVerificationCode(RAW_EMAIL)
            );

            // then
            // 1. 2차 예외에 묻히지 않고, "원래 메일 예외 객체"가 그대로 밖으로 전달되었는지 검증(Assertions 유효)
            Assertions.assertSame(mailException, thrownException);

            // 2. 에러 코드도 한 번 더 확실하게 검증 (assertThat)
            AssertionsForClassTypes.assertThat(thrownException.getErrorCode())
                    .isEqualTo(AuthErrorCode.EMAIL_SEND_FAILED);

            // 3. catch 블록 내의 정리 로직이 시도되었는지 확인
            Mockito.verify(emailVerificationRepository).deleteCode(NORMALIZED_EMAIL);
        }
    }

    @Nested
    @DisplayName("이메일 인증번호 검증")
    class VerifyEmail {

        @Test
        @DisplayName("인증번호가 일치하면 인증 토큰을 발급하고 인증 정보를 정리한다.")
        void verify_success() {
            // given
            Mockito.when(emailVerificationRepository.findCode(NORMALIZED_EMAIL))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(tokenGenerator.generate()).thenReturn(VERIFICATION_TOKEN);

            // when
            VerifyEmailResult result = emailVerificationService.verify(
                    RAW_EMAIL,
                    VERIFICATION_CODE
            );

            // then
            Assertions.assertNotNull(result);

            Assertions.assertAll(
                    () -> Assertions.assertEquals(NORMALIZED_EMAIL, result.email()),
                    () -> Assertions.assertEquals(TOKEN_EXPIRES_IN_SECONDS,
                            result.expiresInSeconds())
            );

            Mockito.verify(emailVerificationRepository)
                    .saveVerificationToken(VERIFICATION_TOKEN, NORMALIZED_EMAIL);

            Mockito.verify(emailVerificationRepository).deleteFailedAttempts(NORMALIZED_EMAIL);
        }

        @Test
        @DisplayName("저장된 인증번호가 없으면 인증번호 만료 예외가 발생한다.")
        void verify_expiredCode() {
            // given
            Mockito.when(emailVerificationRepository.findCode(NORMALIZED_EMAIL))
                    .thenReturn(Optional.empty());

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.verify(RAW_EMAIL, VERIFICATION_CODE)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.EMAIL_VERIFICATION_CODE_EXPIRED,
                    exception.getErrorCode()
            );

            Mockito.verifyNoInteractions(tokenGenerator);

            Mockito.verify(emailVerificationRepository, Mockito.never())
                    .saveVerificationToken(
                            VERIFICATION_TOKEN,
                            NORMALIZED_EMAIL
                    );

            Mockito.verify(emailVerificationRepository, Mockito.never())
                    .deleteCode(NORMALIZED_EMAIL);
        }

        @Test
        @DisplayName("인증번호가 일치하지 않으면 실패 횟수를 증가시키고 불일치 예외가 발생한다.")
        void verify_codeMismatch() {
            // given
            Mockito.when(emailVerificationRepository.findCode(NORMALIZED_EMAIL))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(emailVerificationRepository.incrementFailedAttempts(
                    NORMALIZED_EMAIL
            )).thenReturn(1L);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.verify(
                            RAW_EMAIL,
                            "wrong-code"
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.EMAIL_VERIFICATION_CODE_MISMATCH,
                    exception.getErrorCode()
            );

            Mockito.verify(emailVerificationRepository)
                    .incrementFailedAttempts(NORMALIZED_EMAIL);

            Mockito.verify(emailVerificationRepository, Mockito.never())
                    .deleteCode(NORMALIZED_EMAIL);

            Mockito.verify(emailVerificationRepository, Mockito.never())
                    .deleteFailedAttempts(NORMALIZED_EMAIL);

            Mockito.verifyNoInteractions(tokenGenerator);
        }

        @Test
        @DisplayName("인증번호 검증에 5회 실패하면 인증번호와 실패 횟수를 삭제한다.")
        void verify_attemptsExceeded() {
            // given
            Mockito.when(emailVerificationRepository.findCode(NORMALIZED_EMAIL))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(emailVerificationRepository.incrementFailedAttempts(
                    NORMALIZED_EMAIL
            )).thenReturn(5L);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.verify(
                            RAW_EMAIL,
                            "wrong-code"
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED,
                    exception.getErrorCode()
            );

            Mockito.verify(emailVerificationRepository)
                    .deleteCode(NORMALIZED_EMAIL);

            Mockito.verify(emailVerificationRepository)
                    .deleteFailedAttempts(NORMALIZED_EMAIL);

            Mockito.verifyNoInteractions(tokenGenerator);
        }

        @Test
        @DisplayName("인증번호가 일치하지 않으면 인증 토큰을 저장하지 않는다.")
        void verify_codeMismatch_doesNotIssueToken() {
            // given
            Mockito.when(emailVerificationRepository.findCode(NORMALIZED_EMAIL))
                    .thenReturn(Optional.of(VERIFICATION_CODE));

            Mockito.when(emailVerificationRepository.incrementFailedAttempts(
                    NORMALIZED_EMAIL
            )).thenReturn(2L);

            // when
            Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.verify(
                            RAW_EMAIL,
                            "wrong-code"
                    )
            );

            // then
            Mockito.verifyNoInteractions(tokenGenerator);

            Mockito.verify(emailVerificationRepository, Mockito.never())
                    .saveVerificationToken(
                            Mockito.anyString(),
                            Mockito.anyString()
                    );
        }
    }

    @Nested
    @DisplayName("이메일 인증 토큰 검증")
    class ValidateVerificationToken {

        @Test
        @DisplayName("토큰에 저장된 이메일과 요청 이메일이 일치하면 검증에 성공한다.")
        void validateVerificationToken_success() {
            // given
            Mockito.when(emailVerificationRepository.findEmailByVerificationToken(
                    VERIFICATION_TOKEN
            )).thenReturn(Optional.of(NORMALIZED_EMAIL));

            // when
            emailVerificationService.validateVerificationToken(
                    RAW_EMAIL,
                    VERIFICATION_TOKEN
            );

            // then
            Mockito.verify(emailVerificationRepository)
                    .findEmailByVerificationToken(VERIFICATION_TOKEN);
        }

        @Test
        @DisplayName("인증 토큰이 존재하지 않으면 유효하지 않은 토큰 예외가 발생한다.")
        void validateVerificationToken_invalidToken() {
            // given
            Mockito.when(emailVerificationRepository.findEmailByVerificationToken(
                    VERIFICATION_TOKEN
            )).thenReturn(Optional.empty());

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.validateVerificationToken(
                            RAW_EMAIL,
                            VERIFICATION_TOKEN
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.EMAIL_VERIFICATION_TOKEN_INVALID,
                    exception.getErrorCode()
            );
        }

        @Test
        @DisplayName("토큰의 이메일과 요청 이메일이 다르면 이메일 불일치 예외가 발생한다.")
        void validateVerificationToken_emailMismatch() {
            // given
            Mockito.when(emailVerificationRepository.findEmailByVerificationToken(
                    VERIFICATION_TOKEN
            )).thenReturn(Optional.of("another@example.com"));

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> emailVerificationService.validateVerificationToken(
                            RAW_EMAIL,
                            VERIFICATION_TOKEN
                    )
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.EMAIL_VERIFICATION_EMAIL_MISMATCH,
                    exception.getErrorCode()
            );
        }
    }

    @Nested
    @DisplayName("이메일 인증 토큰 소비")
    class ConsumeVerificationToken {

        @Test
        @DisplayName("인증 토큰을 소비하면 저장소에서 해당 토큰을 삭제한다.")
        void consumeVerificationToken_success() {
            // when
            emailVerificationService.consumeVerificationToken(
                    VERIFICATION_TOKEN
            );

            // then
            Mockito.verify(emailVerificationRepository)
                    .deleteVerificationToken(VERIFICATION_TOKEN);
        }
    }
}
