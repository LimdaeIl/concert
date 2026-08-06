package com.concert.backend.auth.application;

import com.concert.backend.auth.application.command.SignInCommand;
import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SignInService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenIssueService tokenIssueService;

    @Transactional
    public SignInResult signIn(SignInCommand command) {
        Member member = memberRepository.findByEmail(command.email())
                .orElseThrow(
                        () -> new AuthException(
                                AuthErrorCode.INVALID_SIGN_IN
                        )
                );

        validateSignIn(member, command.password());

        return tokenIssueService.issue(member);
    }

    private void validateSignIn(
            Member member,
            String rawPassword
    ) {
        if (!member.isSignInAllowed()) {
            throw new AuthException(AuthErrorCode.INVALID_SIGN_IN);
        }

        if (!passwordEncoder.matches(
                rawPassword,
                member.getPassword()
        )) {
            throw new AuthException(AuthErrorCode.INVALID_SIGN_IN);
        }
    }
}
