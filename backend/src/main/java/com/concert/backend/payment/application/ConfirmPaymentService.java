package com.concert.backend.payment.application;

import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.domain.PaymentGatewayApprovalResult;
import com.concert.backend.payment.domain.PaymentGatewayException;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ConfirmPaymentService {

    private final StartPaymentConfirmationService
            startPaymentConfirmationService;

    private final PaymentApprovalService
            paymentApprovalService;

    private final CompletePaymentService
            completePaymentService;

    private final FailPaymentService
            failPaymentService;

    public PaymentResult confirm(
            Long memberId,
            Long paymentId,
            Long clientAmount,
            Map<String, String> providerData
    ) {
        /*
         * TX 1
         * READY → IN_PROGRESS
         */
        PaymentResult started =
                startPaymentConfirmationService.start(
                        memberId,
                        paymentId,
                        clientAmount
                );

        try {
            /*
             * 외부 PG 네트워크 호출
             * Transaction 없음
             */
            PaymentGatewayApprovalResult approval =
                    paymentApprovalService.approve(
                            started.provider(),
                            started.paymentNumber(),
                            started.amount(),
                            providerData
                    );

            /*
             * TX 2
             *
             * Payment      → PAID
             * Reservation  → COMPLETED
             * Seat         → RESERVED
             */
            return completePaymentService.complete(
                    started.paymentId(),
                    approval
            );

        } catch (PaymentGatewayException exception) {

            failPaymentService.fail(
                    started.paymentId(),
                    exception.getCode(),
                    exception.getMessage()
            );

            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CONFIRMATION_FAILED,
                    exception
            );

        } catch (PaymentException exception) {

            /*
             * PG는 성공했지만 우리 내부 검증/완료 과정에서
             * 문제가 생길 수도 있으므로 단순 FAILED 처리만으로
             * 끝낼 수 없는 케이스가 향후 존재한다.
             *
             * 현재 단계에서는 실패 기록.
             * 이후 결제 보상 트랜잭션 구현 대상.
             */
            failPaymentService.fail(
                    started.paymentId(),
                    "PAYMENT_INTERNAL_ERROR",
                    exception.getMessage()
            );

            throw exception;

        } catch (RuntimeException exception) {

            failPaymentService.fail(
                    started.paymentId(),
                    "PAYMENT_PROVIDER_ERROR",
                    "결제 제공자 처리 중 오류가 발생했습니다."
            );

            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CONFIRMATION_FAILED,
                    exception
            );
        }
    }
}
