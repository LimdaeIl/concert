package com.concert.backend.payment.infrastructure.persistence;

import com.concert.backend.payment.domain.PaymentCancellation;
import com.concert.backend.payment.domain.PaymentCancellationRepository;
import com.concert.backend.payment.infrastructure.jpa.JpaPaymentCancellationRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class PaymentCancellationRepositoryImpl
        implements PaymentCancellationRepository {

    private final JpaPaymentCancellationRepository
            jpaPaymentCancellationRepository;

    @Override
    public PaymentCancellation save(
            PaymentCancellation cancellation
    ) {
        return jpaPaymentCancellationRepository.save(
                cancellation
        );
    }

    @Override
    public Optional<PaymentCancellation> findById(
            Long cancellationId
    ) {
        return jpaPaymentCancellationRepository
                .findById(cancellationId);
    }
}
