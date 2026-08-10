package com.concert.backend.member.application.result;

import com.concert.backend.common.domain.Address;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRole;
import com.concert.backend.member.domain.MemberSocialAccount;
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
        String profileImageUrl,
        Address address,
        List<SocialProvider> socialProviders
) {

    public static GetMeResult from(Member member, String profileImageUrl) {
        List<SocialProvider> providers = member.getSocialAccounts()
                .stream()
                .map(MemberSocialAccount::getProvider)
                .toList();

        return new GetMeResult(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getPhone(),
                member.getRole(),
                member.getStatus(),
                profileImageUrl,
                member.getAddress(),
                providers
        );
    }
}
