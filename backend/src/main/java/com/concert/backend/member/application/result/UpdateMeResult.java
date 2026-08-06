package com.concert.backend.member.application.result;

import com.concert.backend.member.domain.Member;

public record UpdateMeResult(
        Long memberId,
        String email,
        String name,
        String phone
) {

    public static UpdateMeResult from(Member member) {
        return new UpdateMeResult(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getPhone()
        );
    }
}
