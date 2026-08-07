package com.concert.backend.payment.application;

import com.concert.backend.payment.application.result.PaymentCancellationPreparationResult;
import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentCancellation;
import com.concert.backend.payment.domain.PaymentCancellationNumberGenerator;
import com.concert.backend.payment.domain.PaymentCancellationRepository;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
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
public class StartAdminPaymentRefundService {

    private final PaymentRepository paymentRepository;

    private final ReservationRepository
            reservationRepository;

    private final PaymentCancellationRepository
            paymentCancellationRepository;

    private final PaymentCancellationNumberGenerator
            cancellationNumberGenerator;

    private final Clock clock;

    @Transactional
    public PaymentCancellationPreparationResult start(
            Long paymentId,
            String reason
    ) {
        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode.PAYMENT_NOT_FOUND
                                )
                        );

        /*
         * 실제 Reservation이 존재하는지만 검증.
         * 관리자이므로 회원 소유권 검증은 하지 않는다.
         */
        reservationRepository
                .findById(
                        payment.getReservationId()
                )
                .orElseThrow(() ->
                        new ReservationException(
                                ReservationErrorCode
                                        .RESERVATION_NOT_FOUND
                        )
                );

        Long refundAmount =
                payment.getCancellableAmount();

        LocalDateTime now =
                LocalDateTime.now(clock);

        PaymentCancellation cancellation =
                payment.requestCancellation(
                        cancellationNumberGenerator.generate(),
                        refundAmount,
                        reason,
                        now
                );

        PaymentCancellation savedCancellation =
                paymentCancellationRepository.save(
                        cancellation
                );

        return new PaymentCancellationPreparationResult(
                payment.getId(),
                savedCancellation.getId(),
                payment.getProvider(),
                payment.getProviderPaymentId(),
                refundAmount,
                reason
        );
    }
}
