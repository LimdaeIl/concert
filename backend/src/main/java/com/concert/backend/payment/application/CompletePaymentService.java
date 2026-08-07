package com.concert.backend.payment.application;

import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentGatewayApprovalResult;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import com.concert.backend.reservation.application.CompleteReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CompletePaymentService {

    private final PaymentRepository paymentRepository;

    private final CompleteReservationService
            completeReservationService;

    @Transactional
    public PaymentResult complete(
            Long paymentId,
            PaymentGatewayApprovalResult approval
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

        if (!payment.getAmount()
                .equals(approval.amount())) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_AMOUNT_MISMATCH
            );
        }

        payment.complete(
                approval.providerPaymentId(),
                approval.method(),
                approval.approvedAt()
        );

        completeReservationService.complete(
                payment.getReservationId(),
                approval.approvedAt()
        );

        return PaymentResult.from(payment);
    }
}
