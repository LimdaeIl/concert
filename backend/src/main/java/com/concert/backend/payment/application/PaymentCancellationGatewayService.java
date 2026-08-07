package com.concert.backend.payment.application;

import com.concert.backend.payment.domain.PaymentGateway;
import com.concert.backend.payment.domain.PaymentGatewayCancellationCommand;
import com.concert.backend.payment.domain.PaymentGatewayCancellationResult;
import com.concert.backend.payment.domain.PaymentProvider;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PaymentCancellationGatewayService {

    private final PaymentGatewayResolver
            paymentGatewayResolver;

    public PaymentGatewayCancellationResult cancel(
            PaymentProvider provider,
            String providerPaymentId,
            Long amount,
            String reason,
            Map<String, String> providerData
    ) {
        PaymentGateway gateway =
                paymentGatewayResolver.resolve(provider);

        return gateway.cancel(
                new PaymentGatewayCancellationCommand(
                        providerPaymentId,
                        amount,
                        reason,
                        providerData
                )
        );
    }
}
