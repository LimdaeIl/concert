package com.concert.backend.payment.application;

import com.concert.backend.payment.domain.PaymentCancellation;
import com.concert.backend.payment.domain.PaymentCancellationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class FailPaymentCancellationService {

    private final PaymentCancellationRepository
            paymentCancellationRepository;

    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void fail(Long cancellationId) {
        PaymentCancellation cancellation =
                paymentCancellationRepository
                        .findById(cancellationId)
                        .orElse(null);

        if (cancellation == null
                || !cancellation.isRequested()) {
            return;
        }

        cancellation.fail();
    }
}
