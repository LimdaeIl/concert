package com.concert.backend.member.domain;

import java.util.Optional;

public interface MemberSocialAccountRepository {

    Optional<MemberSocialAccount> findByProviderAndProviderUserId(
            SocialProvider provider,
            String providerUserId
    );

    MemberSocialAccount save(MemberSocialAccount socialAccount);
}
