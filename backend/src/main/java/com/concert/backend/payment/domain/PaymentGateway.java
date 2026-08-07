package com.concert.backend.payment.domain;

public interface PaymentGateway {

    PaymentProvider supports();

    PaymentGatewayApprovalResult approve(
            PaymentGatewayApprovalCommand command
    );

    PaymentGatewayCancellationResult cancel(
            PaymentGatewayCancellationCommand command
    );
}
