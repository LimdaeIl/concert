package com.concert.backend.member.application;

import com.concert.backend.auth.domain.OAuth2TicketRepository;
import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.common.storage.event.S3ObjectDeleteEvent;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class DeleteMeService {

    private final MemberRepository memberRepository;

    private final RefreshTokenRepository
            refreshTokenRepository;

    private final OAuth2TicketRepository
            oauth2TicketRepository;

    private final ApplicationEventPublisher
            eventPublisher;

    private final Clock clock;

    @Transactional
    public void deleteMe(
            Long memberId
    ) {
        Member member =
                memberRepository
                        .findById(memberId)
                        .orElseThrow(
                                () ->
                                        new MemberException(
                                                MemberErrorCode.MEMBER_NOT_FOUND
                                        )
                        );

        /*
         * withdraw()에서 profileImageKey를 null 처리하므로
         * 반드시 그 전에 기존 key를 확보한다.
         */
        String profileImageKey =
                member.getProfileImageKey();

        /*
         * 회원 탈퇴 및 개인정보 익명화.
         */
        member.withdraw(
                LocalDateTime.now(
                        clock
                )
        );

        /*
         * 장기 인증 수단 제거.
         */
        refreshTokenRepository
                .deleteByMemberId(
                        memberId
                );

        /*
         * 아직 사용되지 않은
         * OAuth 로그인/가입 ticket 제거.
         */
        oauth2TicketRepository
                .deleteByMemberId(
                        memberId
                );

        /*
         * 실제 S3 삭제는 DB transaction commit 이후
         * S3ObjectDeleteEventListener에서 처리한다.
         */
        if (profileImageKey != null
                && !profileImageKey.isBlank()) {

            eventPublisher.publishEvent(
                    new S3ObjectDeleteEvent(
                            profileImageKey
                    )
            );
        }
    }
}
