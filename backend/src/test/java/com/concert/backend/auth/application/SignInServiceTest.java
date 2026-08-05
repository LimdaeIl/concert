package com.concert.backend.auth.application;

import com.concert.backend.auth.application.command.SignInCommand;
import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.auth.infrastructure.jwt.JwtTokenProvider;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.domain.MemberRole;
import java.time.Duration;
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
    private static final String HASHED_REFRESH_TOKEN = "hashed-refresh-token";

    private static final long REFRESH_TOKEN_REMAINING_MILLIS = 1_800_000L;
    private static final long REFRESH_TOKEN_REMAINING_SECONDS = 1_800L;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenRepository tokenRepository;

    @Mock
    private JWTHashUtil jwtHashUtil;

    @Mock
    private Member member;

    private SignInService signInService;

    @BeforeEach
    void setUp() {
        signInService = new SignInService(
                memberRepository,
                passwordEncoder,
                jwtTokenProvider,
                tokenRepository,
                jwtHashUtil
        );
    }

    private SignInCommand createCommand() {
        return new SignInCommand(
                EMAIL,
                RAW_PASSWORD
        );
    }

    @Nested
    @DisplayName("로그인 성공")
    class SignInSuccess {

        @Test
        @DisplayName("유효한 이메일과 비밀번호이면 토큰을 발급하고 Refresh Token을 저장한다.")
        void signIn_success() {
            // given
            SignInCommand command = createCommand();

            Mockito.when(memberRepository.findByEmail(EMAIL))
                    .thenReturn(Optional.of(member));

            Mockito.when(member.isSignInAllowed())
                    .thenReturn(true);

            Mockito.when(member.getPassword())
                    .thenReturn(ENCODED_PASSWORD);

            Mockito.when(member.getId())
                    .thenReturn(MEMBER_ID);

            Mockito.when(member.getRole())
                    .thenReturn(MemberRole.MEMBER);

            Mockito.when(
                    passwordEncoder.matches(
                            RAW_PASSWORD,
                            ENCODED_PASSWORD
                    )
            ).thenReturn(true);

            Mockito.when(
                    jwtTokenProvider.createAccessToken(
                            MEMBER_ID,
                            MemberRole.MEMBER.name()
                    )
            ).thenReturn(ACCESS_TOKEN);

            Mockito.when(
                    jwtTokenProvider.createRefreshToken(MEMBER_ID)
            ).thenReturn(REFRESH_TOKEN);

            Mockito.when(
                    jwtTokenProvider.getRefreshTokenRemainingMillis(
                            REFRESH_TOKEN
                    )
            ).thenReturn(REFRESH_TOKEN_REMAINING_MILLIS);

            Mockito.when(jwtHashUtil.sha256(REFRESH_TOKEN))
                    .thenReturn(HASHED_REFRESH_TOKEN);

            Mockito.when(
                    jwtTokenProvider.getRefreshTokenRemainingSeconds(
                            REFRESH_TOKEN
                    )
            ).thenReturn(REFRESH_TOKEN_REMAINING_SECONDS);

            // when
            SignInResult result = signInService.signIn(command);

            // then
            Assertions.assertNotNull(result);

            Mockito.verify(memberRepository)
                    .findByEmail(EMAIL);

            Mockito.verify(passwordEncoder)
                    .matches(RAW_PASSWORD, ENCODED_PASSWORD);

            Mockito.verify(jwtTokenProvider)
                    .createAccessToken(
                            MEMBER_ID,
                            MemberRole.MEMBER.name()
                    );

            Mockito.verify(jwtTokenProvider)
                    .createRefreshToken(MEMBER_ID);

            Mockito.verify(jwtHashUtil)
                    .sha256(REFRESH_TOKEN);

            Mockito.verify(tokenRepository)
                    .save(
                            MEMBER_ID,
                            HASHED_REFRESH_TOKEN,
                            Duration.ofMillis(
                                    REFRESH_TOKEN_REMAINING_MILLIS
                            )
                    );
        }

        @Test
        @DisplayName("Refresh Token은 원문이 아니라 해시값으로 저장한다.")
        void signIn_savesHashedRefreshToken() {
            // given
            SignInCommand command = createCommand();

            Mockito.when(memberRepository.findByEmail(EMAIL))
                    .thenReturn(Optional.of(member));

            Mockito.when(member.isSignInAllowed())
                    .thenReturn(true);

            Mockito.when(member.getPassword())
                    .thenReturn(ENCODED_PASSWORD);

            Mockito.when(member.getId())
                    .thenReturn(MEMBER_ID);

            Mockito.when(member.getRole())
                    .thenReturn(MemberRole.MEMBER);

            Mockito.when(
                    passwordEncoder.matches(
                            RAW_PASSWORD,
                            ENCODED_PASSWORD
                    )
            ).thenReturn(true);

            Mockito.when(
                    jwtTokenProvider.createAccessToken(
                            MEMBER_ID,
                            MemberRole.MEMBER.name()
                    )
            ).thenReturn(ACCESS_TOKEN);

            Mockito.when(
                    jwtTokenProvider.createRefreshToken(MEMBER_ID)
            ).thenReturn(REFRESH_TOKEN);

            Mockito.when(
                    jwtTokenProvider.getRefreshTokenRemainingMillis(
                            REFRESH_TOKEN
                    )
            ).thenReturn(REFRESH_TOKEN_REMAINING_MILLIS);

            Mockito.when(jwtHashUtil.sha256(REFRESH_TOKEN))
                    .thenReturn(HASHED_REFRESH_TOKEN);

            Mockito.when(
                    jwtTokenProvider.getRefreshTokenRemainingSeconds(
                            REFRESH_TOKEN
                    )
            ).thenReturn(REFRESH_TOKEN_REMAINING_SECONDS);

            // when
            signInService.signIn(command);

            // then
            Mockito.verify(jwtHashUtil)
                    .sha256(REFRESH_TOKEN);

            Mockito.verify(tokenRepository)
                    .save(
                            MEMBER_ID,
                            HASHED_REFRESH_TOKEN,
                            Duration.ofMillis(
                                    REFRESH_TOKEN_REMAINING_MILLIS
                            )
                    );

            Mockito.verify(tokenRepository, Mockito.never())
                    .save(
                            Mockito.eq(MEMBER_ID),
                            Mockito.eq(REFRESH_TOKEN),
                            Mockito.any(Duration.class)
                    );
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

            Mockito.verifyNoInteractions(passwordEncoder);
            Mockito.verifyNoInteractions(jwtTokenProvider);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }

        @Test
        @DisplayName("로그인이 허용되지 않은 회원이면 비밀번호 검증 없이 로그인에 실패한다.")
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

            Mockito.verifyNoInteractions(passwordEncoder);
            Mockito.verifyNoInteractions(jwtTokenProvider);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
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
                    .matches(RAW_PASSWORD, ENCODED_PASSWORD);

            Mockito.verifyNoInteractions(jwtTokenProvider);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }
    }
}
