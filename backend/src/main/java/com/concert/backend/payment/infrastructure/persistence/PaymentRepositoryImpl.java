package com.concert.backend.payment.infrastructure.persistence;

import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.infrastructure.jpa.JpaPaymentRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class PaymentRepositoryImpl
        implements PaymentRepository {

    private final JpaPaymentRepository
            jpaPaymentRepository;

    @Override
    public Payment save(Payment payment) {
        return jpaPaymentRepository.save(payment);
    }

    @Override
    public Optional<Payment> findById(
            Long paymentId
    ) {
        return jpaPaymentRepository.findById(
                paymentId
        );
    }

    @Override
    public Optional<Payment> findByIdAndReservationId(
            Long paymentId,
            Long reservationId
    ) {
        return jpaPaymentRepository
                .findByIdAndReservationId(
                        paymentId,
                        reservationId
                );
    }

    @Override
    public Optional<Payment> findByPaymentNumber(
            String paymentNumber
    ) {
        return jpaPaymentRepository
                .findByPaymentNumber(
                        paymentNumber
                );
    }

    @Override
    public boolean existsActivePaymentByReservationId(
            Long reservationId
    ) {
        return jpaPaymentRepository
                .existsActivePaymentByReservationId(
                        reservationId
                );
    }
}
