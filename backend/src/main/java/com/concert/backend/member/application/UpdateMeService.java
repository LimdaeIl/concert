package com.concert.backend.member.application;

import com.concert.backend.common.domain.Address;
import com.concert.backend.member.application.command.UpdateMeCommand;
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
public class UpdateMeService {

    private final MemberRepository memberRepository;

    @Transactional
    public GetMeResult updateMe(
            Long memberId,
            UpdateMeCommand command
    ) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new MemberException(
                                MemberErrorCode.MEMBER_NOT_FOUND
                        )
                );

        Address address = Address.of(
                command.roadAddress(),
                command.jibunAddress(),
                command.detailAddress(),
                command.zipCode(),
                command.latitude(),
                command.longitude()
        );

        member.updateProfile(
                command.name(),
                address
        );

        return GetMeResult.from(member);
    }
}
