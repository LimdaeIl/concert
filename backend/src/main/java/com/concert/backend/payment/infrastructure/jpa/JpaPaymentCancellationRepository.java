package com.concert.backend.payment.infrastructure.jpa;

import com.concert.backend.payment.domain.PaymentCancellation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaPaymentCancellationRepository
        extends JpaRepository<
        PaymentCancellation,
        Long
        > {
}