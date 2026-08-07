package com.concert.backend.reservation.infrastructure;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.reservation")
public record ReservationProperties(
        Duration paymentTimeout,
        Duration expirationScanDelay
) {
}
