package com.concert.backend.payment.application;

import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class FailPaymentService {

    private final PaymentRepository paymentRepository;

    /*
     * PG 호출 실패 이후 기존 트랜잭션과 독립적으로
     * FAILED 상태를 반드시 기록하기 위해
     * REQUIRES_NEW를 사용한다.
     */
    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void fail(
            Long paymentId,
            String failureCode,
            String failureMessage
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

        if (!payment.isInProgress()) {
            return;
        }

        payment.fail(
                failureCode,
                failureMessage
        );
    }
}
