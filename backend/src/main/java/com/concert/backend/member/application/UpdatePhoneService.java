package com.concert.backend.member.application;

import com.concert.backend.auth.application.PhoneVerificationService;
import com.concert.backend.auth.domain.PhoneNumberNormalizer;
import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.member.application.command.UpdatePhoneCommand;
import com.concert.backend.member.application.event.MemberPhoneChangedEvent;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdatePhoneService {

    private final MemberRepository memberRepository;
    private final PhoneVerificationService phoneVerificationService;
    private final PhoneNumberNormalizer phoneNumberNormalizer;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ApplicationEventPublisher eventPublisher;


    @Transactional
    public void updatePhone(Long memberId, UpdatePhoneCommand command) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));

        if (!member.isSignInAllowed()) {
            throw new MemberException(MemberErrorCode.MEMBER_NOT_ACTIVE);
        }

        String phone = phoneNumberNormalizer.normalize(command.phone());

        if (member.getPhone().equals(phone)) {
            throw new MemberException(MemberErrorCode.SAME_AS_CURRENT_PHONE);
        }

        phoneVerificationService.validateVerificationToken(phone, command.phoneVerificationToken());

        if (memberRepository.existsByPhone(phone)) {
            throw new MemberException(MemberErrorCode.DUPLICATE_PHONE);
        }

        member.changePhone(phone);

        refreshTokenRepository.deleteByMemberId(memberId);

        eventPublisher.publishEvent(new MemberPhoneChangedEvent(command.phoneVerificationToken()));
    }

}
