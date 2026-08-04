package com.concert.backend.auth.application.event;

import com.concert.backend.auth.application.PhoneVerificationService;
import com.concert.backend.member.application.event.MemberSignedUpEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class PhoneVerificationTokenCleanupEventListener {

    private final PhoneVerificationService phoneVerificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void consumeVerificationToken(MemberSignedUpEvent event) {
        try {
            phoneVerificationService.consumeVerificationToken(
                    event.phoneVerificationToken()
            );
        } catch (RuntimeException exception) {
            /*
             * AFTER_COMMIT 단계에서는 회원가입 트랜잭션이 이미 성공한 상태입니다.
             * 토큰 삭제 실패를 다시 던져도 회원가입을 롤백할 수 없으므로
             * 오류만 기록하고 Redis TTL에 의해 자연 만료되도록 둡니다.
             */
            log.error(
                    "회원가입 완료 후 휴대전화 인증 토큰 삭제에 실패했습니다.",
                    exception
            );
        }
    }
}
