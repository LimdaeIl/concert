package com.concert.backend.payment.application;

import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class StartPaymentConfirmationService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final Clock clock;

    @Transactional
    public PaymentResult start(
            Long memberId,
            Long paymentId,
            Long clientAmount
    ) {
        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode.PAYMENT_NOT_FOUND
                                )
                        );

        Reservation reservation =
                reservationRepository
                        .findByIdAndMemberId(
                                payment.getReservationId(),
                                memberId
                        )
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode.PAYMENT_NOT_FOUND
                                )
                        );

        LocalDateTime now =
                LocalDateTime.now(clock);

        if (!reservation.isPendingPayment()
                || reservation.isExpired(now)) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_EXPIRED
            );
        }

        if (!payment.getAmount()
                .equals(clientAmount)) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_AMOUNT_MISMATCH
            );
        }

        if (!reservation.getTotalAmount()
                .equals(payment.getAmount())) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_AMOUNT_MISMATCH
            );
        }

        payment.startConfirmation();

        return PaymentResult.from(payment);
    }
}

