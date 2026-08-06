package com.concert.backend.member.application.result;

import com.concert.backend.common.domain.Address;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRole;
import com.concert.backend.member.domain.MemberStatus;
import com.concert.backend.member.domain.SocialProvider;
import java.util.List;

public record GetMeResult(
        Long memberId,
        String email,
        String name,
        String phone,
        MemberRole role,
        MemberStatus status,
        Address address,
        List<SocialProvider> socialProviders
) {

    public static GetMeResult from(Member member) {
        List<SocialProvider> providers = member.getSocialAccounts()
                .stream()
                .map(account -> account.getProvider())
                .toList();

        return new GetMeResult(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getPhone(),
                member.getRole(),
                member.getStatus(),
                member.getAddress(),
                providers
        );
    }
}
