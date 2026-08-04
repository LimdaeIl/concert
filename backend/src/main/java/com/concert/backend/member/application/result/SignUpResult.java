package com.concert.backend.member.application.result;

import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRole;
import com.concert.backend.member.domain.MemberStatus;

public record SignUpResult(
        Long memberId,
        String email,
        String name,
        MemberRole role,
        MemberStatus status
) {

    public static SignUpResult from(Member member) {
        return new SignUpResult(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getRole(),
                member.getStatus()
        );
    }
}
