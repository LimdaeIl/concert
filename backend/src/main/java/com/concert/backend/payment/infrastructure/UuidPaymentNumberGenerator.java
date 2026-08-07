package com.concert.backend.payment.infrastructure;

import com.concert.backend.payment.domain.PaymentNumberGenerator;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class UuidPaymentNumberGenerator
        implements PaymentNumberGenerator {

    @Override
    public String generate() {
        return "P"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 20)
                .toUpperCase();
    }
}
