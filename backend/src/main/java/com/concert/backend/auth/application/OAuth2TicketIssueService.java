package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.ExistingSocialMemberResult;
import com.concert.backend.auth.application.result.NewSocialMemberResult;
import com.concert.backend.auth.application.result.SocialAuthenticationResult;
import com.concert.backend.auth.domain.OAuth2TicketPayload;
import com.concert.backend.auth.domain.OAuth2TicketRepository;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.auth.infrastructure.oauth.OAuth2FlowProperties;
import com.concert.backend.auth.infrastructure.oauth.OAuth2TicketGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class OAuth2TicketIssueService {

    private final OAuth2TicketGenerator ticketGenerator;
    private final OAuth2TicketRepository ticketRepository;
    private final OAuth2FlowProperties flowProperties;
    private final JWTHashUtil jwtHashUtil;

    public OAuth2IssuedTicket issue(
            SocialAuthenticationResult result
    ) {
        if (result instanceof ExistingSocialMemberResult existing) {
            return issueLoginTicket(existing);
        }

        if (result instanceof NewSocialMemberResult newMember) {
            return issueSignupTicket(newMember);
        }

        throw new IllegalStateException(
                "알 수 없는 소셜 인증 결과입니다."
        );
    }

    private OAuth2IssuedTicket issueLoginTicket(
            ExistingSocialMemberResult result
    ) {
        String rawTicket = ticketGenerator.generate();
        String ticketHash = jwtHashUtil.sha256(rawTicket);

        ticketRepository.save(
                ticketHash,
                OAuth2TicketPayload.login(result.memberId()),
                flowProperties.loginCodeExpiration()
        );

        return OAuth2IssuedTicket.login(rawTicket);
    }

    private OAuth2IssuedTicket issueSignupTicket(
            NewSocialMemberResult result
    ) {
        String rawTicket = ticketGenerator.generate();
        String ticketHash = jwtHashUtil.sha256(rawTicket);

        var userInfo = result.userInfo();

        ticketRepository.save(
                ticketHash,
                OAuth2TicketPayload.signup(
                        userInfo.provider(),
                        userInfo.providerUserId(),
                        userInfo.email(),
                        userInfo.name()
                ),
                flowProperties.signupTicketExpiration()
        );

        return OAuth2IssuedTicket.signup(rawTicket);
    }
}
