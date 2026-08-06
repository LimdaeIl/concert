package com.concert.backend.member.application;

import com.concert.backend.auth.application.EmailVerificationService;
import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.member.application.command.UpdateEmailCommand;
import com.concert.backend.member.application.event.MemberEmailChangedEvent;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdateEmailService {

    private final MemberRepository memberRepository;
    private final EmailVerificationService emailVerificationService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void updateEmail(Long memberId, UpdateEmailCommand command) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));

        if (!member.isSignInAllowed()) {
            throw new MemberException(MemberErrorCode.MEMBER_NOT_ACTIVE);
        }

        String normalizedEmail = normalizeEmail(command.email());

        /*
         * 동일 이메일 여부를 먼저 확인해 불필요한 인증 토큰 검증을 피한다.
         */
        if (member.getEmail().equalsIgnoreCase(normalizedEmail)) {
            throw new MemberException(MemberErrorCode.SAME_AS_CURRENT_EMAIL);
        }

        /*
         * 인증 토큰이 새 이메일에 대해 발급된 것인지 검증한다.
         */
        emailVerificationService.validateVerificationToken(normalizedEmail, command.emailVerificationToken());

        validateDuplicateEmail(normalizedEmail);

        member.changeEmail(normalizedEmail);

        /*
         * 이메일은 일반 로그인 식별자이므로 기존 재발급 세션을 폐기한다.
         */
        refreshTokenRepository.deleteByMemberId(memberId);

        eventPublisher.publishEvent(
                new MemberEmailChangedEvent(command.emailVerificationToken())
        );
    }

    private void validateDuplicateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new MemberException(MemberErrorCode.DUPLICATE_EMAIL);
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
