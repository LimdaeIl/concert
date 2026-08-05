package com.concert.backend.auth.application;

import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.auth.infrastructure.jwt.JwtTokenProvider;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SignOutServiceTest {

    private static final Long MEMBER_ID = 1L;

    private static final String REFRESH_TOKEN = "refresh-token";
    private static final String HASHED_REFRESH_TOKEN = "hashed-refresh-token";
    private static final String OTHER_HASHED_REFRESH_TOKEN =
            "other-hashed-refresh-token";

    @Mock
    private RefreshTokenRepository tokenRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private JWTHashUtil jwtHashUtil;

    private SignOutService signOutService;

    @BeforeEach
    void setUp() {
        signOutService = new SignOutService(
                tokenRepository,
                jwtTokenProvider,
                jwtHashUtil
        );
    }

    @Nested
    @DisplayName("로그아웃 성공")
    class SignOutSuccess {

        @Test
        @DisplayName("유효한 Refresh Token이면 회원의 저장된 토큰을 삭제한다.")
        void signOut_success() {
            // given
            Mockito.when(
                    jwtTokenProvider.getMemberIdFromRefreshToken(REFRESH_TOKEN)
            ).thenReturn(MEMBER_ID);

            Mockito.when(jwtHashUtil.sha256(REFRESH_TOKEN))
                    .thenReturn(HASHED_REFRESH_TOKEN);

            Mockito.when(tokenRepository.findByMemberId(MEMBER_ID))
                    .thenReturn(Optional.of(HASHED_REFRESH_TOKEN));

            // when
            signOutService.signOut(REFRESH_TOKEN);

            // then
            Mockito.verify(jwtTokenProvider)
                    .getMemberIdFromRefreshToken(REFRESH_TOKEN);

            Mockito.verify(jwtHashUtil)
                    .sha256(REFRESH_TOKEN);

            Mockito.verify(tokenRepository)
                    .findByMemberId(MEMBER_ID);

            Mockito.verify(tokenRepository)
                    .deleteByMemberId(MEMBER_ID);
        }
    }

    @Nested
    @DisplayName("로그아웃 실패")
    class SignOutFailure {

        @Test
        @DisplayName("Refresh Token이 null이면 로그아웃에 실패한다.")
        void signOut_nullRefreshToken() {
            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signOutService.signOut(null)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MISSING_REFRESH_TOKEN,
                    exception.getErrorCode()
            );

            Mockito.verifyNoInteractions(jwtTokenProvider);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }

        @Test
        @DisplayName("Refresh Token이 공백이면 로그아웃에 실패한다.")
        void signOut_blankRefreshToken() {
            // given
            String blankRefreshToken = "   ";

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signOutService.signOut(blankRefreshToken)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MISSING_REFRESH_TOKEN,
                    exception.getErrorCode()
            );

            Mockito.verifyNoInteractions(jwtTokenProvider);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }

        @Test
        @DisplayName("회원에게 저장된 Refresh Token이 없으면 로그아웃에 실패한다.")
        void signOut_storedRefreshTokenNotFound() {
            // given
            Mockito.when(
                    jwtTokenProvider.getMemberIdFromRefreshToken(REFRESH_TOKEN)
            ).thenReturn(MEMBER_ID);

            Mockito.when(jwtHashUtil.sha256(REFRESH_TOKEN))
                    .thenReturn(HASHED_REFRESH_TOKEN);

            Mockito.when(tokenRepository.findByMemberId(MEMBER_ID))
                    .thenReturn(Optional.empty());

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signOutService.signOut(REFRESH_TOKEN)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MISSING_REFRESH_TOKEN,
                    exception.getErrorCode()
            );

            Mockito.verify(tokenRepository, Mockito.never())
                    .deleteByMemberId(MEMBER_ID);
        }

        @Test
        @DisplayName("요청한 Refresh Token과 저장된 토큰이 다르면 로그아웃에 실패한다.")
        void signOut_refreshTokenMismatch() {
            // given
            Mockito.when(
                    jwtTokenProvider.getMemberIdFromRefreshToken(REFRESH_TOKEN)
            ).thenReturn(MEMBER_ID);

            Mockito.when(jwtHashUtil.sha256(REFRESH_TOKEN))
                    .thenReturn(HASHED_REFRESH_TOKEN);

            Mockito.when(tokenRepository.findByMemberId(MEMBER_ID))
                    .thenReturn(Optional.of(OTHER_HASHED_REFRESH_TOKEN));

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> signOutService.signOut(REFRESH_TOKEN)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MISMATCH_REFRESH_TOKEN,
                    exception.getErrorCode()
            );

            Mockito.verify(tokenRepository, Mockito.never())
                    .deleteByMemberId(MEMBER_ID);
        }
    }
}
