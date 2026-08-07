package com.concert.backend.payment.application;

import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentCancellation;
import com.concert.backend.payment.domain.PaymentCancellationRepository;
import com.concert.backend.payment.domain.PaymentGatewayCancellationResult;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.domain.PaymentStatus;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import com.concert.backend.reservation.application.CancelReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CompletePaymentCancellationService {

    private final PaymentRepository paymentRepository;

    private final PaymentCancellationRepository
            paymentCancellationRepository;

    private final CancelReservationService
            cancelReservationService;

    @Transactional
    public PaymentResult complete(
            Long paymentId,
            Long cancellationId,
            PaymentGatewayCancellationResult result
    ) {
        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode
                                                .PAYMENT_NOT_FOUND
                                )
                        );

        PaymentCancellation cancellation =
                paymentCancellationRepository
                        .findById(cancellationId)
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode
                                                .INVALID_PAYMENT_CANCELLATION_STATUS
                                )
                        );

        if (!cancellation.getPayment()
                .getId()
                .equals(payment.getId())) {
            throw new PaymentException(
                    PaymentErrorCode
                            .INVALID_PAYMENT_CANCELLATION_STATUS
            );
        }

        if (!cancellation.getAmount()
                .equals(result.cancelledAmount())) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_AMOUNT_MISMATCH
            );
        }

        payment.completeCancellation(
                cancellation,
                result.providerCancellationId(),
                result.cancelledAt()
        );

        if (payment.getStatus()
                != PaymentStatus.CANCELLED) {
            throw new PaymentException(
                    PaymentErrorCode
                            .INVALID_PAYMENT_STATUS
            );
        }

        cancelReservationService
                .cancelAfterPaymentCancellation(
                        payment.getReservationId(),
                        result.cancelledAt()
                );

        return PaymentResult.from(payment);
    }
}

