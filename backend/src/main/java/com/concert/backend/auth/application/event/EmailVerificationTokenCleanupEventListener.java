package com.concert.backend.auth.application.event;

import com.concert.backend.auth.application.EmailVerificationService;
import com.concert.backend.member.application.event.MemberSignedUpEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailVerificationTokenCleanupEventListener {

    private final EmailVerificationService emailVerificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void consumeVerificationToken(MemberSignedUpEvent event) {
        try {
            emailVerificationService.consumeVerificationToken(event.emailVerificationToken());
        } catch (RuntimeException exception) {
            log.error("회원가입 완료 후 이메일 인증 토큰 삭제에 실패했습니다.", exception);
        }
    }
}
