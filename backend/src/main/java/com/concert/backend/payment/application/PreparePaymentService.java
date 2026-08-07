package com.concert.backend.payment.application;

import com.concert.backend.payment.application.command.PreparePaymentCommand;
import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentNumberGenerator;
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
public class PreparePaymentService {

    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentNumberGenerator paymentNumberGenerator;
    private final Clock clock;

    @Transactional
    public PaymentResult prepare(
            Long memberId,
            Long reservationId,
            PreparePaymentCommand command
    ) {
        Reservation reservation =
                reservationRepository
                        .findByIdAndMemberId(
                                reservationId,
                                memberId
                        )
                        .orElseThrow(() ->
                                new ReservationException(
                                        ReservationErrorCode.RESERVATION_NOT_FOUND
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

        if (paymentRepository
                .existsActivePaymentByReservationId(
                        reservationId
                )) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_ALREADY_EXISTS
            );
        }

        Payment payment = Payment.create(
                paymentNumberGenerator.generate(),
                reservationId,
                command.provider(),
                reservation.getTotalAmount(),
                now
        );

        Payment savedPayment =
                paymentRepository.save(payment);

        return PaymentResult.from(savedPayment);
    }
}
