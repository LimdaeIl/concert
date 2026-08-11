package com.concert.backend.common.config.properties;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(
        prefix = "app.cache"
)
public record CacheProperties(
        PopularConcert popularConcert
) {

    public CacheProperties {
        if (popularConcert == null) {
            popularConcert =
                    new PopularConcert(
                            Duration.ofSeconds(30)
                    );
        }
    }

    public record PopularConcert(
            Duration timeToLive
    ) {

        public PopularConcert {
            if (timeToLive == null) {
                timeToLive =
                        Duration.ofSeconds(30);
            }

            if (timeToLive.isZero()
                    || timeToLive.isNegative()) {
                throw new IllegalArgumentException(
                        "인기 공연 Cache TTL은 "
                                + "0보다 커야 합니다."
                );
            }
        }
    }
}
