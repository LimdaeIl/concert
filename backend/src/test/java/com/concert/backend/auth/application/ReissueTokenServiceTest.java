package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.ReissueTokenResult;
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
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReissueTokenServiceTest {

    private static final Long MEMBER_ID = 1L;

    private static final String OLD_REFRESH_TOKEN = "old-refresh-token";
    private static final String NEW_ACCESS_TOKEN = "new-access-token";
    private static final String NEW_REFRESH_TOKEN = "new-refresh-token";

    private static final String HASHED_OLD_REFRESH_TOKEN =
            "hashed-old-refresh-token";

    private static final String HASHED_NEW_REFRESH_TOKEN =
            "hashed-new-refresh-token";

    private static final long REFRESH_TOKEN_EXPIRATION_MILLIS =
            1_800_000L;

    private static final Duration REFRESH_TOKEN_TTL =
            Duration.ofMillis(REFRESH_TOKEN_EXPIRATION_MILLIS);

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private RefreshTokenRepository tokenRepository;

    @Mock
    private JWTHashUtil jwtHashUtil;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private Member member;

    private ReissueTokenService reissueTokenService;

    @BeforeEach
    void setUp() {
        reissueTokenService = new ReissueTokenService(
                memberRepository,
                tokenRepository,
                jwtHashUtil,
                jwtTokenProvider
        );
    }

    @Nested
    @DisplayName("토큰 재발급 성공")
    class ReissueSuccess {

        @Test
        @DisplayName("유효한 Refresh Token이면 새로운 Access Token과 Refresh Token을 발급한다.")
        void reissue_success() {
            // given
            Mockito.when(
                    jwtTokenProvider.getMemberIdFromRefreshToken(
                            OLD_REFRESH_TOKEN
                    )
            ).thenReturn(MEMBER_ID);

            Mockito.when(memberRepository.findById(MEMBER_ID))
                    .thenReturn(Optional.of(member));

            Mockito.when(member.getId())
                    .thenReturn(MEMBER_ID);

            Mockito.when(member.getRole())
                    .thenReturn(MemberRole.MEMBER);

            Mockito.when(
                    jwtTokenProvider.createAccessToken(
                            MEMBER_ID,
                            MemberRole.MEMBER.name()
                    )
            ).thenReturn(NEW_ACCESS_TOKEN);

            Mockito.when(
                    jwtTokenProvider.createRefreshToken(MEMBER_ID)
            ).thenReturn(NEW_REFRESH_TOKEN);

            Mockito.when(jwtHashUtil.sha256(OLD_REFRESH_TOKEN))
                    .thenReturn(HASHED_OLD_REFRESH_TOKEN);

            Mockito.when(jwtHashUtil.sha256(NEW_REFRESH_TOKEN))
                    .thenReturn(HASHED_NEW_REFRESH_TOKEN);

            Mockito.when(
                    jwtTokenProvider.getRefreshTokenExpirationMillis()
            ).thenReturn(REFRESH_TOKEN_EXPIRATION_MILLIS);

            // when
            ReissueTokenResult result =
                    reissueTokenService.reissue(OLD_REFRESH_TOKEN);

            // then
            Assertions.assertNotNull(result);

            Assertions.assertAll(
                    () -> Assertions.assertEquals(
                            MEMBER_ID,
                            result.memberId()
                    ),
                    () -> Assertions.assertEquals(
                            NEW_ACCESS_TOKEN,
                            result.accessToken()
                    ),
                    () -> Assertions.assertEquals(
                            NEW_REFRESH_TOKEN,
                            result.refreshToken()
                    ),
                    () -> Assertions.assertEquals(
                            REFRESH_TOKEN_TTL.toSeconds(),
                            result.refreshTokenExpiresInSeconds()
                    )
            );

            Mockito.verify(jwtTokenProvider)
                    .createAccessToken(
                            MEMBER_ID,
                            MemberRole.MEMBER.name()
                    );

            Mockito.verify(jwtTokenProvider)
                    .createRefreshToken(MEMBER_ID);
        }

        @Test
        @DisplayName("기존 Refresh Token의 해시를 검증하여 새로운 Refresh Token의 해시로 교체한다.")
        void reissue_rotatesRefreshToken() {
            // given
            Mockito.when(
                    jwtTokenProvider.getMemberIdFromRefreshToken(
                            OLD_REFRESH_TOKEN
                    )
            ).thenReturn(MEMBER_ID);

            Mockito.when(memberRepository.findById(MEMBER_ID))
                    .thenReturn(Optional.of(member));

            Mockito.when(member.getId())
                    .thenReturn(MEMBER_ID);

            Mockito.when(member.getRole())
                    .thenReturn(MemberRole.MEMBER);

            Mockito.when(
                    jwtTokenProvider.createAccessToken(
                            MEMBER_ID,
                            MemberRole.MEMBER.name()
                    )
            ).thenReturn(NEW_ACCESS_TOKEN);

            Mockito.when(
                    jwtTokenProvider.createRefreshToken(MEMBER_ID)
            ).thenReturn(NEW_REFRESH_TOKEN);

            Mockito.when(jwtHashUtil.sha256(OLD_REFRESH_TOKEN))
                    .thenReturn(HASHED_OLD_REFRESH_TOKEN);

            Mockito.when(jwtHashUtil.sha256(NEW_REFRESH_TOKEN))
                    .thenReturn(HASHED_NEW_REFRESH_TOKEN);

            Mockito.when(
                    jwtTokenProvider.getRefreshTokenExpirationMillis()
            ).thenReturn(REFRESH_TOKEN_EXPIRATION_MILLIS);

            // when
            reissueTokenService.reissue(OLD_REFRESH_TOKEN);

            // then
            Mockito.verify(jwtHashUtil)
                    .sha256(OLD_REFRESH_TOKEN);

            Mockito.verify(jwtHashUtil)
                    .sha256(NEW_REFRESH_TOKEN);

            Mockito.verify(tokenRepository)
                    .rotateIfMatches(
                            MEMBER_ID,
                            HASHED_OLD_REFRESH_TOKEN,
                            HASHED_NEW_REFRESH_TOKEN,
                            REFRESH_TOKEN_TTL
                    );
        }
    }

    @Nested
    @DisplayName("토큰 재발급 실패")
    class ReissueFailure {

        @Test
        @DisplayName("Refresh Token이 null이면 토큰 재발급에 실패한다.")
        void reissue_nullRefreshToken() {
            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> reissueTokenService.reissue(null)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MISSING_REFRESH_TOKEN,
                    exception.getErrorCode()
            );

            Mockito.verifyNoInteractions(jwtTokenProvider);
            Mockito.verifyNoInteractions(memberRepository);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }

        @Test
        @DisplayName("Refresh Token이 공백이면 토큰 재발급에 실패한다.")
        void reissue_blankRefreshToken() {
            // given
            String blankRefreshToken = "   ";

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> reissueTokenService.reissue(blankRefreshToken)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.MISSING_REFRESH_TOKEN,
                    exception.getErrorCode()
            );

            Mockito.verifyNoInteractions(jwtTokenProvider);
            Mockito.verifyNoInteractions(memberRepository);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }

        @Test
        @DisplayName("Refresh Token에 해당하는 회원이 없으면 토큰을 재발급하지 않는다.")
        void reissue_memberNotFound() {
            // given
            Mockito.when(
                    jwtTokenProvider.getMemberIdFromRefreshToken(
                            OLD_REFRESH_TOKEN
                    )
            ).thenReturn(MEMBER_ID);

            Mockito.when(memberRepository.findById(MEMBER_ID))
                    .thenReturn(Optional.empty());

            // when
            AuthException exception = Assertions.assertThrows(
                    AuthException.class,
                    () -> reissueTokenService.reissue(OLD_REFRESH_TOKEN)
            );

            // then
            Assertions.assertEquals(
                    AuthErrorCode.NOT_FOUND_BY_MEMBER_ID,
                    exception.getErrorCode()
            );

            Mockito.verify(memberRepository)
                    .findById(MEMBER_ID);

            Mockito.verify(
                    jwtTokenProvider,
                    Mockito.never()
            ).createAccessToken(
                    Mockito.anyLong(),
                    Mockito.anyString()
            );

            Mockito.verify(
                    jwtTokenProvider,
                    Mockito.never()
            ).createRefreshToken(Mockito.anyLong());

            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }

        @Test
        @DisplayName("유효하지 않은 Refresh Token이면 회원 조회와 토큰 교체를 수행하지 않는다.")
        void reissue_invalidRefreshToken() {
            // given
            AuthException tokenException = Mockito.mock(AuthException.class);

            Mockito.when(
                    jwtTokenProvider.getMemberIdFromRefreshToken(
                            OLD_REFRESH_TOKEN
                    )
            ).thenThrow(tokenException);

            // when
            AuthException thrownException = Assertions.assertThrows(
                    AuthException.class,
                    () -> reissueTokenService.reissue(OLD_REFRESH_TOKEN)
            );

            // then
            Assertions.assertSame(
                    tokenException,
                    thrownException
            );

            Mockito.verifyNoInteractions(memberRepository);
            Mockito.verifyNoInteractions(jwtHashUtil);
            Mockito.verifyNoInteractions(tokenRepository);
        }
    }
}
