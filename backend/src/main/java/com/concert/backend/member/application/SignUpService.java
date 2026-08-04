package com.concert.backend.member.application;

import com.concert.backend.auth.application.EmailVerificationService;
import com.concert.backend.auth.application.PhoneVerificationService;
import com.concert.backend.common.domain.Address;
import com.concert.backend.member.application.command.SignUpCommand;
import com.concert.backend.member.application.event.MemberSignedUpEvent;
import com.concert.backend.member.application.result.SignUpResult;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SignUpService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final PhoneVerificationService phoneVerificationService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public SignUpResult signUp(SignUpCommand command) {
        validateDuplicateEmail(command.email());
        validateDuplicatePhone(command.phone());

        emailVerificationService.validateVerificationToken(command.email(), command.emailVerificationToken());
        phoneVerificationService.validateVerificationToken(command.phone(), command.phoneVerificationToken());

        String encodedPassword = passwordEncoder.encode(command.password());

        Address address = Address.of(
                command.roadAddress(),
                command.jibunAddress(),
                command.detailAddress(),
                command.zipCode(),
                command.latitude(),
                command.longitude()
        );

        Member member = Member.createLocal(
                command.email(),
                encodedPassword,
                command.name(),
                command.phone(),
                address
        );

        Member savedMember = memberRepository.save(member);

        eventPublisher.publishEvent(
                new MemberSignedUpEvent(
                        command.emailVerificationToken(),
                        command.phoneVerificationToken()
                )
        );

        return SignUpResult.from(savedMember);
    }

    private void validateDuplicateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new MemberException(MemberErrorCode.DUPLICATE_EMAIL);
        }
    }

    private void validateDuplicatePhone(String phone) {
        if (memberRepository.existsByPhone(phone)) {
            throw new MemberException(MemberErrorCode.DUPLICATE_PHONE);
        }
    }
}
