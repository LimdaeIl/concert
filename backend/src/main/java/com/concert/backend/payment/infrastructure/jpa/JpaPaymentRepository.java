package com.concert.backend.payment.infrastructure.jpa;

import com.concert.backend.payment.domain.Payment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JpaPaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByIdAndReservationId(
            Long id,
            Long reservationId
    );

    Optional<Payment> findByPaymentNumber(
            String paymentNumber
    );

    @Query("""
            select count(p) > 0
            from Payment p
            where p.reservationId = :reservationId
              and p.status in (
                  com.concert.backend.payment.domain.PaymentStatus.READY,
                  com.concert.backend.payment.domain.PaymentStatus.IN_PROGRESS,
                  com.concert.backend.payment.domain.PaymentStatus.PAID
              )
            """)
    boolean existsActivePaymentByReservationId(
            @Param("reservationId")
            Long reservationId
    );
}

