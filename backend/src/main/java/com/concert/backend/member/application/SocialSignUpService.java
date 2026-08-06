package com.concert.backend.member.application;

import com.concert.backend.auth.application.PhoneVerificationService;
import com.concert.backend.auth.application.TokenIssueService;
import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.domain.OAuth2TicketPayload;
import com.concert.backend.auth.domain.OAuth2TicketRepository;
import com.concert.backend.auth.domain.OAuth2TicketType;
import com.concert.backend.auth.domain.PhoneNumberNormalizer;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.common.domain.Address;
import com.concert.backend.member.application.command.SocialSignUpCommand;
import com.concert.backend.member.application.event.SocialMemberSignedUpEvent;
import com.concert.backend.member.application.result.SocialSignUpResult;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.domain.MemberSocialAccountRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SocialSignUpService {

    private final OAuth2TicketRepository ticketRepository;
    private final JWTHashUtil jwtHashUtil;

    private final MemberRepository memberRepository;
    private final MemberSocialAccountRepository socialAccountRepository;

    private final PhoneVerificationService phoneVerificationService;
    private final PhoneNumberNormalizer phoneNumberNormalizer;

    private final TokenIssueService tokenIssueService;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Transactional
    public SocialSignUpResult signUp(SocialSignUpCommand command) {
        String ticketHash = hashTicket(command.ticket());

        OAuth2TicketPayload ticketPayload = findSignupTicket(ticketHash);

        validateTicketPayload(ticketPayload);

        String normalizedPhone = phoneNumberNormalizer.normalize(command.phone());

        phoneVerificationService.validateVerificationToken(normalizedPhone, command.phoneVerificationToken());

        validateDuplicateSocialAccount(ticketPayload);
        validateDuplicateEmail(ticketPayload.email());
        validateDuplicatePhone(normalizedPhone);

        consumeTicket(ticketHash);

        Address address = Address.of(
                command.roadAddress(),
                command.jibunAddress(),
                command.detailAddress(),
                command.zipCode(),
                command.latitude(),
                command.longitude()
        );

        Member member = Member.createSocial(
                ticketPayload.email(),
                resolveName(ticketPayload),
                normalizedPhone,
                address
        );

        LocalDateTime now = LocalDateTime.now(clock);

        member.addSocialAccount(
                ticketPayload.provider(),
                ticketPayload.providerUserId(),
                ticketPayload.email(),
                now
        );

        Member savedMember = memberRepository.save(member);

        eventPublisher.publishEvent(
                new SocialMemberSignedUpEvent(
                        command.phoneVerificationToken()
                )
        );

        SignInResult tokenResult =
                tokenIssueService.issue(savedMember);

        return SocialSignUpResult.of(
                savedMember.getId(),
                tokenResult.accessToken(),
                tokenResult.refreshToken(),
                tokenResult.refreshTokenRemainingSecond()
        );
    }

    private String hashTicket(String rawTicket) {
        if (rawTicket == null || rawTicket.isBlank()) {
            throw new AuthException(
                    AuthErrorCode.OAUTH2_TICKET_REQUIRED
            );
        }

        return jwtHashUtil.sha256(rawTicket);
    }

    private OAuth2TicketPayload findSignupTicket(
            String ticketHash
    ) {
        return ticketRepository.find(ticketHash)
                .orElseThrow(
                        () -> new AuthException(
                                AuthErrorCode.OAUTH2_TICKET_INVALID
                        )
                );
    }

    private void consumeTicket(String ticketHash) {
        boolean consumed = ticketRepository.consume(ticketHash);

        if (!consumed) {
            throw new AuthException(
                    AuthErrorCode.OAUTH2_TICKET_INVALID
            );
        }
    }

    private void validateTicketPayload(
            OAuth2TicketPayload ticketPayload
    ) {
        if (ticketPayload.type() != OAuth2TicketType.SIGNUP) {
            throw new AuthException(
                    AuthErrorCode.INVALID_OAUTH2_TICKET_TYPE
            );
        }

        if (ticketPayload.provider() == null
                || ticketPayload.providerUserId() == null
                || ticketPayload.providerUserId().isBlank()) {
            throw new AuthException(
                    AuthErrorCode.OAUTH2_TICKET_INVALID
            );
        }

        if (ticketPayload.email() == null
                || ticketPayload.email().isBlank()) {
            throw new AuthException(
                    AuthErrorCode.OAUTH2_EMAIL_REQUIRED
            );
        }
    }

    private void validateDuplicateSocialAccount(
            OAuth2TicketPayload payload
    ) {
        boolean exists = socialAccountRepository
                .findByProviderAndProviderUserId(
                        payload.provider(),
                        payload.providerUserId()
                )
                .isPresent();

        if (exists) {
            throw new AuthException(
                    AuthErrorCode.OAUTH2_TICKET_INVALID
            );
        }
    }

    private void validateDuplicateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new MemberException(
                    MemberErrorCode.DUPLICATE_EMAIL
            );
        }
    }

    private void validateDuplicatePhone(String phone) {
        if (memberRepository.existsByPhone(phone)) {
            throw new MemberException(
                    MemberErrorCode.DUPLICATE_PHONE
            );
        }
    }

    private String resolveName(
            OAuth2TicketPayload payload
    ) {
        if (payload.name() == null
                || payload.name().isBlank()) {
            return payload.provider().name() + "_USER";
        }

        return payload.name();
    }
}
