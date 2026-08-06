package com.concert.backend.member.application;

import com.concert.backend.member.application.result.GetMeResult;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetMeService {

    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public GetMeResult getMe(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND)
                );

        if (!member.isSignInAllowed()) {
            throw new MemberException(MemberErrorCode.MEMBER_NOT_ACTIVE);
        }

        return GetMeResult.from(member);
    }
}