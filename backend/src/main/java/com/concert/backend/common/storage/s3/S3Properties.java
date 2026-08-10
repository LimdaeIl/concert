package com.concert.backend.common.storage.s3;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage.s3")
public record S3Properties(
        String bucket,
        String region,
        Duration uploadUrlExpiration,
        Duration readUrlExpiration
) {
}
