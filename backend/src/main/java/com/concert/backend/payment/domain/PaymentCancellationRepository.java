package com.concert.backend.payment.domain;

import java.util.Optional;

public interface PaymentCancellationRepository {

    PaymentCancellation save(
            PaymentCancellation cancellation
    );

    Optional<PaymentCancellation> findById(
            Long cancellationId
    );
}
