package com.concert.backend.payment.application;

import com.concert.backend.payment.domain.PaymentGateway;
import com.concert.backend.payment.domain.PaymentGatewayApprovalCommand;
import com.concert.backend.payment.domain.PaymentGatewayApprovalResult;
import com.concert.backend.payment.domain.PaymentProvider;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PaymentApprovalService {

    private final PaymentGatewayResolver
            paymentGatewayResolver;

    public PaymentGatewayApprovalResult approve(
            PaymentProvider provider,
            String paymentNumber,
            Long amount,
            Map<String, String> providerData
    ) {
        PaymentGateway gateway =
                paymentGatewayResolver.resolve(
                        provider
                );

        return gateway.approve(
                new PaymentGatewayApprovalCommand(
                        paymentNumber,
                        amount,
                        providerData
                )
        );
    }
}

