package com.concert.backend.member.infrastructure.jpa;

import com.concert.backend.member.domain.MemberSocialAccount;
import com.concert.backend.member.domain.SocialProvider;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaMemberSocialAccountRepository extends JpaRepository<MemberSocialAccount, Long> {

    Optional<MemberSocialAccount> findByProviderAndProviderUserId(SocialProvider provider, String providerUserId);
}
