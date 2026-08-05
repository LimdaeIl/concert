package com.concert.backend.member.application;

import com.concert.backend.auth.application.EmailVerificationService;
import com.concert.backend.auth.application.PhoneVerificationService;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.member.application.command.SignUpCommand;
import com.concert.backend.member.application.event.MemberSignedUpEvent;
import com.concert.backend.member.application.result.SignUpResult;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import org.assertj.core.api.AssertionsForClassTypes;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class SignUpServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private PhoneVerificationService phoneVerificationService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private SignUpService signUpService;

    @BeforeEach
    void setUp() {
        signUpService = new SignUpService(
                memberRepository,
                passwordEncoder,
                emailVerificationService,
                phoneVerificationService,
                eventPublisher
        );
    }

    private SignUpCommand createCommand() {
        return new SignUpCommand(
                "member@example.com",
                "Password123!",
                "홍길동",
                "01012345678",
                "서울특별시 강남구 테헤란로 1",
                "서울특별시 강남구 역삼동 1",
                "101호",
                "06234",
                null,
                null,
                "email-verification-token",
                "phone-verification-token"
        );
    }

    @Nested
    @DisplayName("회원가입 성공")
    class SignUpSuccess {

        @Test
        @DisplayName("유효한 회원가입 요청이면 회원을 저장하고 가입 이벤트를 발행한다.")
        void signUp_success() {
            // given
            SignUpCommand command = createCommand();
            String encodedPassword = "encoded-password";

            Mockito.when(memberRepository.existsByEmail(command.email())).thenReturn(false);
            Mockito.when(memberRepository.existsByPhone(command.phone())).thenReturn(false);
            Mockito.when(passwordEncoder.encode(command.password())).thenReturn(encodedPassword);
            Mockito.when(memberRepository.save(ArgumentMatchers.any(Member.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // when
            SignUpResult result = signUpService.signUp(command);

            // then
            Assertions.assertNotNull(result);

            Mockito.verify(emailVerificationService)
                    .validateVerificationToken(command.email(), command.emailVerificationToken());
            Mockito.verify(phoneVerificationService)
                    .validateVerificationToken(command.phone(), command.phoneVerificationToken());

            Mockito.verify(memberRepository).existsByEmail(command.email());
            Mockito.verify(memberRepository).existsByPhone(command.phone());
            Mockito.verify(passwordEncoder).encode(command.password());
            Mockito.verify(memberRepository).save(ArgumentMatchers.any(Member.class));

            ArgumentCaptor<MemberSignedUpEvent> eventCaptor =
                    ArgumentCaptor.forClass(MemberSignedUpEvent.class);

            Mockito.verify(eventPublisher).publishEvent(eventCaptor.capture());

            MemberSignedUpEvent publishedEvent = eventCaptor.getValue();

            Assertions.assertAll(
                    () -> Assertions.assertEquals(
                            command.emailVerificationToken(),
                            publishedEvent.emailVerificationToken()
                    ),
                    () -> Assertions.assertEquals(
                            command.phoneVerificationToken(),
                            publishedEvent.phoneVerificationToken()
                    )
            );
        }

        @Test
        @DisplayName("비밀번호 원문이 아니라 암호화된 비밀번호로 회원을 생성한다.")
        void signUp_encodesPassword() {
            // given
            SignUpCommand command = createCommand();
            String encodedPassword = "encoded-password";

            Mockito.when(memberRepository.existsByEmail(command.email())).thenReturn(false);
            Mockito.when(memberRepository.existsByPhone(command.phone())).thenReturn(false);
            Mockito.when(passwordEncoder.encode(command.password())).thenReturn(encodedPassword);
            Mockito.when(memberRepository.save(ArgumentMatchers.any(Member.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            ArgumentCaptor<Member> memberCaptor = ArgumentCaptor.forClass(Member.class);

            // when
            signUpService.signUp(command);

            // then
            Mockito.verify(memberRepository).save(memberCaptor.capture());

            Member savedMember = memberCaptor.getValue();

            Assertions.assertAll(
                    () -> Assertions.assertEquals(command.email(), savedMember.getEmail()),
                    () -> Assertions.assertEquals(command.phone(), savedMember.getPhone()),
                    () -> Assertions.assertEquals(command.name(), savedMember.getName()),
                    () -> Assertions.assertEquals(encodedPassword, savedMember.getPassword()),
                    () -> Assertions.assertNotEquals(command.password(), savedMember.getPassword())
            );
        }

    }


    @Nested
    @DisplayName("회원가입 실패")
    class SignUpFailure {

        @Test
        @DisplayName("이메일 인증 토큰 검증에 실패하면 AuthException이 발생하며 회원가입을 중단한다")
        void signUp_failsWhenEmailVerificationFails() {
            // given
            SignUpCommand command = createCommand();

            // 1. 실제로 서비스에서 던지는 구체적인 예외 객체 생성
            AuthException invalidTokenException = new AuthException(
                    AuthErrorCode.EMAIL_VERIFICATION_TOKEN_INVALID);

            // 2. Mock 객체가 실제와 동일한 AuthException을 던지도록 작성
            Mockito.doThrow(invalidTokenException)
                    .when(emailVerificationService)
                    .validateVerificationToken(command.email(), command.emailVerificationToken());

            // when & then: 예외가 발생하는지 검증
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signUpService.signUp(command)
            );

            // 3. 터진 예외의 에러 코드가 'EMAIL_VERIFICATION_TOKEN_INVALID'인지 검증
            AssertionsForClassTypes.assertThat(exception.getErrorCode())
                    .isEqualTo(AuthErrorCode.EMAIL_VERIFICATION_TOKEN_INVALID);

            // 4. Fast-Fail로 인해 부작용(DB, 저장, 이벤트 발행 등)이 발생하지 않았는지 확인
            Mockito.verifyNoInteractions(
                    phoneVerificationService,
                    memberRepository,
                    passwordEncoder,
                    eventPublisher
            );
        }

        @Test
        @DisplayName("휴대전화번호 인증 토큰 검증에 실패하면 AuthException이 발생하며 회원가입을 중단한다.")
        void signUp_failsWhenPhoneVerificationFails() {
            // given
            SignUpCommand command = createCommand();

            // 1. 실제로 서비스에서 던지는 구체적인 예외 객체 생성
            AuthException invalidTokenException = new AuthException(
                    AuthErrorCode.PHONE_VERIFICATION_TOKEN_INVALID);

            // 2. Mock 객체가 실제와 동일한 AuthException을 던지도록 작성
            Mockito.doThrow(invalidTokenException)
                    .when(phoneVerificationService)
                    .validateVerificationToken(command.phone(), command.phoneVerificationToken());

            // when & then: 예외가 발생하는지 검증
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signUpService.signUp(command)
            );

            // 3. 터진 예외의 에러 코드가 'PHONE_VERIFICATION_TOKEN_INVALID'인지 검증
            AssertionsForClassTypes.assertThat(exception.getErrorCode())
                    .isEqualTo(AuthErrorCode.PHONE_VERIFICATION_TOKEN_INVALID);

            // 4. Fast-Fail로 인해 부작용(DB, 저장, 이벤트 발행 등)이 발생하지 않았는지 확인
            Mockito.verifyNoInteractions(
                    memberRepository,
                    passwordEncoder,
                    eventPublisher
            );
        }

        @Test
        @DisplayName("이미 가입된 이메일이면 MemberException이 발생하며 회원가입을 중단한다.")
        void signUp_failsWhenEmailAlreadyExists() {
            // given
            SignUpCommand command = createCommand();

            Mockito.when(memberRepository.existsByEmail(command.email())).thenReturn(true);

            // when & then
            MemberException exception = Assertions.assertThrows(
                    MemberException.class,
                    () -> signUpService.signUp(command)
            );

            AssertionsForClassTypes.assertThat(exception.getErrorCode())
                    .isEqualTo(MemberErrorCode.DUPLICATE_EMAIL);
            Assertions.assertEquals(MemberErrorCode.DUPLICATE_EMAIL.getMessage(),
                    exception.getMessage());

            // Fast-Fail 검증(저장 및 이벤트 발행 미실행)
            Mockito.verify(memberRepository, Mockito.never()).save(Mockito.any());
            Mockito.verifyNoInteractions(eventPublisher);
        }

        @Test
        @DisplayName("이미 가입된 휴대전화번호이면 MemberException이 발생하며 회원가입을 중단한다.")
        void signUp_failsWhenPhoneAlreadyExists() {
            // given
            SignUpCommand command = createCommand();

            Mockito.when(memberRepository.existsByEmail(command.email())).thenReturn(false);
            Mockito.when(memberRepository.existsByPhone(command.phone())).thenReturn(true);

            // when & then
            MemberException exception = Assertions.assertThrows(
                    MemberException.class,
                    () -> signUpService.signUp(command)
            );

            AssertionsForClassTypes.assertThat(exception.getErrorCode())
                    .isEqualTo(MemberErrorCode.DUPLICATE_PHONE);

            // Fast-Fail 검증
            Mockito.verify(memberRepository, Mockito.never()).save(Mockito.any());
            Mockito.verifyNoInteractions(eventPublisher);
        }
    }
}
