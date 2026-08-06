package com.concert.backend.auth.application;

import com.concert.backend.auth.application.command.SignInCommand;
import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.member.domain.Member;
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
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class SignInServiceTest {

    private static final Long MEMBER_ID = 1L;

    private static final String EMAIL = "member@example.com";
    private static final String RAW_PASSWORD = "Password123!";
    private static final String ENCODED_PASSWORD = "encoded-password";

    private static final String ACCESS_TOKEN = "access-token";
    private static final String REFRESH_TOKEN = "refresh-token";
    private static final long REFRESH_TOKEN_REMAINING_SECONDS = 1_800L;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenIssueService tokenIssueService;

    @Mock
    private Member member;

    private SignInService signInService;

    @BeforeEach
    void setUp() {
        signInService = new SignInService(
                memberRepository,
                passwordEncoder,
                tokenIssueService
        );
    }

    private SignInCommand createCommand() {
        return new SignInCommand(
                EMAIL,
                RAW_PASSWORD
        );
    }

    private SignInResult createSignInResult() {
        return SignInResult.of(
                MEMBER_ID,
                ACCESS_TOKEN,
                REFRESH_TOKEN,
                REFRESH_TOKEN_REMAINING_SECONDS
        );
    }

    @Nested
    @DisplayName("로그인 성공")
    class SignInSuccess {

        @Test
        @DisplayName("유효한 이메일과 비밀번호이면 토큰 발급 서비스에 회원을 전달한다.")
        void signIn_success() {
            // given
            SignInCommand command = createCommand();
            SignInResult expectedResult = createSignInResult();

            Mockito.when(memberRepository.findByEmail(EMAIL))
                    .thenReturn(Optional.of(member));

            Mockito.when(member.isSignInAllowed())
                    .thenReturn(true);

            Mockito.when(member.getPassword())
                    .thenReturn(ENCODED_PASSWORD);

            Mockito.when(
                    passwordEncoder.matches(
                            RAW_PASSWORD,
                            ENCODED_PASSWORD
                    )
            ).thenReturn(true);

            Mockito.when(tokenIssueService.issue(member))
                    .thenReturn(expectedResult);

            // when
            SignInResult result = signInService.signIn(command);

            // then
            Assertions.assertSame(expectedResult, result);

            InOrder inOrder = Mockito.inOrder(
                    memberRepository,
                    member,
                    passwordEncoder,
                    tokenIssueService
            );

            inOrder.verify(memberRepository)
                    .findByEmail(EMAIL);

            inOrder.verify(member)
                    .isSignInAllowed();

            inOrder.verify(member).getPassword();

            inOrder.verify(passwordEncoder)
                    .matches(
                            RAW_PASSWORD,
                            ENCODED_PASSWORD
                    );

            inOrder.verify(tokenIssueService)
                    .issue(member);
        }
    }

    @Nested
    @DisplayName("로그인 실패")
    class SignInFailure {

        @Test
        @DisplayName("이메일에 해당하는 회원이 없으면 로그인에 실패한다.")
        void signIn_memberNotFound() {
            // given
            SignInCommand command = createCommand();

            Mockito.when(memberRepository.findByEmail(EMAIL))
                    .thenReturn(Optional.empty());

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signInService.signIn(command)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.INVALID_SIGN_IN,
                    exception.getErrorCode()
            );

            Mockito.verify(memberRepository)
                    .findByEmail(EMAIL);

            Mockito.verifyNoInteractions(member);
            Mockito.verifyNoInteractions(passwordEncoder);
            Mockito.verifyNoInteractions(tokenIssueService);
        }

        @Test
        @DisplayName("로그인이 허용되지 않은 회원이면 비밀번호 검증 없이 실패한다.")
        void signIn_notAllowedMember() {
            // given
            SignInCommand command = createCommand();

            Mockito.when(memberRepository.findByEmail(EMAIL))
                    .thenReturn(Optional.of(member));

            Mockito.when(member.isSignInAllowed())
                    .thenReturn(false);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signInService.signIn(command)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.INVALID_SIGN_IN,
                    exception.getErrorCode()
            );

            Mockito.verify(member)
                    .isSignInAllowed();

            Mockito.verify(member, Mockito.never())
                    .getPassword();

            Mockito.verifyNoInteractions(passwordEncoder);
            Mockito.verifyNoInteractions(tokenIssueService);
        }

        @Test
        @DisplayName("비밀번호가 일치하지 않으면 토큰을 발급하지 않고 로그인에 실패한다.")
        void signIn_passwordMismatch() {
            // given
            SignInCommand command = createCommand();

            Mockito.when(memberRepository.findByEmail(EMAIL))
                    .thenReturn(Optional.of(member));

            Mockito.when(member.isSignInAllowed())
                    .thenReturn(true);

            Mockito.when(member.getPassword())
                    .thenReturn(ENCODED_PASSWORD);

            Mockito.when(
                    passwordEncoder.matches(
                            RAW_PASSWORD,
                            ENCODED_PASSWORD
                    )
            ).thenReturn(false);

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signInService.signIn(command)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.INVALID_SIGN_IN,
                    exception.getErrorCode()
            );

            Mockito.verify(passwordEncoder)
                    .matches(
                            RAW_PASSWORD,
                            ENCODED_PASSWORD
                    );

            Mockito.verifyNoInteractions(tokenIssueService);
        }
    }
}
