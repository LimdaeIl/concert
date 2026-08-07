package com.concert.backend.payment.domain;

import java.util.Optional;

public interface PaymentRepository {

    Payment save(Payment payment);

    Optional<Payment> findById(Long paymentId);

    Optional<Payment> findByIdAndReservationId(
            Long paymentId,
            Long reservationId
    );

    Optional<Payment> findByPaymentNumber(
            String paymentNumber
    );

    boolean existsActivePaymentByReservationId(
            Long reservationId
    );
}
