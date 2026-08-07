package com.concert.backend.payment.infrastructure;

import com.concert.backend.payment.domain.PaymentCancellationNumberGenerator;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class UuidPaymentCancellationNumberGenerator
        implements PaymentCancellationNumberGenerator {

    @Override
    public String generate() {
        return "C"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 20)
                .toUpperCase();
    }
}
