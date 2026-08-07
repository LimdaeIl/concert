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
public class CancelPaymentService {

    private final StartPaymentCancellationService
            startPaymentCancellationService;

    private final PaymentCancellationGatewayService
            paymentCancellationGatewayService;

    private final CompletePaymentCancellationService
            completePaymentCancellationService;

    private final FailPaymentCancellationService
            failPaymentCancellationService;

    public PaymentResult cancel(
            Long memberId,
            Long paymentId,
            String reason,
            Map<String, String> providerData
    ) {
        PaymentCancellationPreparationResult started =
                startPaymentCancellationService.startFullCancellation(
                        memberId,
                        paymentId,
                        reason
                );

        try {
            PaymentGatewayCancellationResult gatewayResult =
                    paymentCancellationGatewayService.cancel(
                            started.provider(),
                            started.providerPaymentId(),
                            started.amount(),
                            started.reason(),
                            providerData
                    );

            return completePaymentCancellationService
                    .complete(
                            started.paymentId(),
                            started.paymentCancellationId(),
                            gatewayResult
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
