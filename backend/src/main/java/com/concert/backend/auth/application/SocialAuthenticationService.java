package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.ExistingSocialMemberResult;
import com.concert.backend.auth.application.result.NewSocialMemberResult;
import com.concert.backend.auth.application.result.SocialAuthenticationResult;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.oauth.userinfo.OAuth2UserInfo;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberSocialAccount;
import com.concert.backend.member.domain.MemberSocialAccountRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SocialAuthenticationService {

    private final MemberSocialAccountRepository socialAccountRepository;
    private final Clock clock;

    @Transactional
    public SocialAuthenticationResult authenticate(OAuth2UserInfo userInfo) {

        Optional<MemberSocialAccount> socialAccountOptional =
                socialAccountRepository.findByProviderAndProviderUserId(
                        userInfo.provider(),
                        userInfo.providerUserId()
                );

        if (socialAccountOptional.isEmpty()) {
            return new NewSocialMemberResult(userInfo);
        }

        return existingMember(socialAccountOptional.get());
    }

    private ExistingSocialMemberResult existingMember(MemberSocialAccount socialAccount) {
        Member member = socialAccount.getMember();

        if (!member.isSignInAllowed()) {
            throw new AuthException(AuthErrorCode.OAUTH2_LOGIN_FAILED);
        }
        socialAccount.updateLastLoginAt(LocalDateTime.now(clock));

        return new ExistingSocialMemberResult(member.getId());
    }
}
