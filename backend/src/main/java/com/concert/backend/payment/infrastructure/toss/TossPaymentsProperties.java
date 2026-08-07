package com.concert.backend.payment.infrastructure.toss;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.toss.payments")
public record TossPaymentsProperties(
        String secretKey,
        String apiUrl
) {
}
