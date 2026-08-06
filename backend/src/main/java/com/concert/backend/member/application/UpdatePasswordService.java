package com.concert.backend.member.application;

import com.concert.backend.auth.domain.RefreshTokenRepository;
import com.concert.backend.member.application.command.UpdatePasswordCommand;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdatePasswordService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void updatePassword(Long memberId, UpdatePasswordCommand command) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND)l);

        validatePasswordChangeAvailable(member);
        validateCurrentPassword(member, command.currentPassword());
        validateNewPassword(member, command.newPassword());

        String encodedNewPassword = passwordEncoder.encode(command.newPassword());

        member.changePassword(encodedNewPassword);

        /*
         * 비밀번호 변경 후 기존 Refresh Token을 폐기해
         * 모든 재발급 세션을 종료한다.
         */
        refreshTokenRepository.deleteByMemberId(memberId);
    }

    private void validatePasswordChangeAvailable(Member member) {
        if (!member.isSignInAllowed()) {
            throw new MemberException(MemberErrorCode.MEMBER_NOT_ACTIVE);
        }

        if (!member.hasPassword()) {
            throw new MemberException(MemberErrorCode.PASSWORD_CHANGE_NOT_AVAILABLE);
        }
    }

    private void validateCurrentPassword(Member member, String currentPassword) {
        if (!passwordEncoder.matches(currentPassword, member.getPassword())) {
            throw new MemberException(MemberErrorCode.INVALID_PASSWORD);
        }
    }

    private void validateNewPassword(Member member, String newPassword) {
        if (passwordEncoder.matches(newPassword, member.getPassword())) {
            throw new MemberException(MemberErrorCode.SAME_AS_CURRENT_PASSWORD);
        }
    }
}
