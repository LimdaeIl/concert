package com.concert.backend.member.application.event;

import com.concert.backend.auth.application.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class MemberEmailChangedEventListener {

    private final EmailVerificationService emailVerificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(MemberEmailChangedEvent event) {
        emailVerificationService.consumeVerificationToken(
                event.emailVerificationToken()
        );
    }
}
