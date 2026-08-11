package com.concert.backend.payment.application;

import com.concert.backend.concert.application.event.PopularConcertCacheEvictEvent;
import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentGatewayApprovalResult;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import com.concert.backend.reservation.application.CompleteReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CompletePaymentService {

    private final PaymentRepository paymentRepository;

    private final CompleteReservationService
            completeReservationService;

    private final ApplicationEventPublisher
            eventPublisher;

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

        /*
         * 결제 상태를 PAID로 변경한다.
         */
        payment.complete(
                approval.providerPaymentId(),
                approval.method(),
                approval.approvedAt()
        );

        /*
         * 예약을 COMPLETED로 변경하고
         * 선점된 좌석을 RESERVED 상태로 확정한다.
         *
         * 이 시점부터 인기 공연의
         * 판매 좌석 집계 값이 변경된다.
         */
        completeReservationService.complete(
                payment.getReservationId(),
                approval.approvedAt()
        );

        /*
         * 인기 공연 캐시 무효화 이벤트를 발행한다.
         *
         * 여기서 즉시 Redis를 삭제하는 것이 아니라,
         * Listener에서 AFTER_COMMIT 시점에 처리한다.
         *
         * 따라서 현재 Transaction이 rollback 되면
         * 캐시는 삭제되지 않는다.
         */
        eventPublisher.publishEvent(
                new PopularConcertCacheEvictEvent()
        );

        return PaymentResult.from(payment);
    }
}
