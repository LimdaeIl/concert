package com.concert.backend.member.application.event;

import com.concert.backend.auth.application.PhoneVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class SocialMemberSignedUpEventListener {

    private final PhoneVerificationService phoneVerificationService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
            SocialMemberSignedUpEvent event
    ) {
        phoneVerificationService.consumeVerificationToken(
                event.phoneVerificationToken()
        );
    }
}
