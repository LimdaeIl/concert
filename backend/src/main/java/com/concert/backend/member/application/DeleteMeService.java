package com.concert.backend.member.application;

import com.concert.backend.auth.domain.OAuth2TicketRepository;
import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class DeleteMeService {

    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuth2TicketRepository oauth2TicketRepository;
    private final Clock clock;

    @Transactional
    public void deleteMe(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));

        member.withdraw(
                LocalDateTime.now(clock)
        );

        /*
         * 장기 인증 수단 제거
         */
        refreshTokenRepository.deleteByMemberId(
                memberId
        );

        /*
         * 발급됐지만 아직 사용되지 않은 OAuth LOGIN 코드 제거
         */
        oauth2TicketRepository.deleteByMemberId(
                memberId
        );
    }
}

