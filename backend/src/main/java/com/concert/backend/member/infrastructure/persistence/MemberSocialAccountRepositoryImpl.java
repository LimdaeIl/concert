package com.concert.backend.member.infrastructure.persistence;

import com.concert.backend.member.domain.MemberSocialAccount;
import com.concert.backend.member.domain.MemberSocialAccountRepository;
import com.concert.backend.member.domain.SocialProvider;
import com.concert.backend.member.infrastructure.jpa.JpaMemberSocialAccountRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class MemberSocialAccountRepositoryImpl implements MemberSocialAccountRepository {

    private final JpaMemberSocialAccountRepository jpaRepository;

    @Override
    public Optional<MemberSocialAccount> findByProviderAndProviderUserId(SocialProvider provider,
            String providerUserId) {
        return jpaRepository.findByProviderAndProviderUserId(provider, providerUserId);
    }

    @Override
    public MemberSocialAccount save(MemberSocialAccount socialAccount) {
        return jpaRepository.save(socialAccount);
    }
}
