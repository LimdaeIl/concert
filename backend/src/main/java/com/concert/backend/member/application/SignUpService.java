package com.concert.backend.member.application;

import com.concert.backend.common.domain.Address;
import com.concert.backend.member.application.command.SignUpCommand;
import com.concert.backend.member.application.result.SignUpResult;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SignUpService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SignUpResult signUp(SignUpCommand command) {
        validateDuplicateEmail(command.email());
        validateDuplicatePhone(command.phone());

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

        return SignUpResult.from(savedMember);
    }

    private void validateDuplicateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
    }

    private void validateDuplicatePhone(String phone) {
        if (memberRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("이미 사용 중인 휴대전화 번호입니다.");
        }
    }
}

