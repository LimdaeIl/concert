package com.concert.backend.payment.application;

import com.concert.backend.payment.domain.PaymentGateway;
import com.concert.backend.payment.domain.PaymentProvider;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class PaymentGatewayResolver {

    private final Map<
            PaymentProvider,
            PaymentGateway
            > gateways;

    public PaymentGatewayResolver(
            List<PaymentGateway> paymentGateways
    ) {
        Map<PaymentProvider, PaymentGateway> map =
                new EnumMap<>(
                        PaymentProvider.class
                );

        for (PaymentGateway gateway
                : paymentGateways) {

            PaymentGateway previous =
                    map.put(
                            gateway.supports(),
                            gateway
                    );

            if (previous != null) {
                throw new IllegalStateException(
                        "동일 PaymentProvider에 "
                                + "PaymentGateway가 중복 등록되었습니다: "
                                + gateway.supports()
                );
            }
        }

        this.gateways = Map.copyOf(map);
    }

    public PaymentGateway resolve(
            PaymentProvider provider
    ) {
        PaymentGateway gateway =
                gateways.get(provider);

        if (gateway == null) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_PROVIDER_NOT_SUPPORTED
            );
        }

        return gateway;
    }
}
