package com.concert.backend.payment.application;

import com.concert.backend.payment.application.result.PaymentCancellationPreparationResult;
import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.domain.PaymentGatewayCancellationResult;
import com.concert.backend.payment.domain.PaymentGatewayException;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AdminRefundPaymentService {

    private final StartAdminPaymentRefundService
            startAdminPaymentRefundService;

    private final PaymentCancellationGatewayService
            paymentCancellationGatewayService;

    private final CompleteAdminPaymentRefundService
            completeAdminPaymentRefundService;

    private final FailPaymentCancellationService
            failPaymentCancellationService;

    public PaymentResult refund(
            Long paymentId,
            String reason,
            Map<String, String> providerData
    ) {
        PaymentCancellationPreparationResult started =
                startAdminPaymentRefundService.start(
                        paymentId,
                        reason
                );

        try {
            PaymentGatewayCancellationResult result =
                    paymentCancellationGatewayService
                            .cancel(
                                    started.provider(),
                                    started.providerPaymentId(),
                                    started.amount(),
                                    started.reason(),
                                    providerData
                            );

            return completeAdminPaymentRefundService
                    .complete(
                            started.paymentId(),
                            started.paymentCancellationId(),
                            result
                    );

        } catch (PaymentGatewayException exception) {

            failPaymentCancellationService.fail(
                    started.paymentCancellationId()
            );

            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CANCELLATION_FAILED,
                    exception
            );
        }
    }
}
