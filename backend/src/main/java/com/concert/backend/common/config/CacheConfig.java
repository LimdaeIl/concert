package com.concert.backend.common.config;

import com.concert.backend.common.config.properties.CacheProperties;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

@EnableCaching
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(
        CacheProperties.class
)
public class CacheConfig {

    private static final String POPULAR_CONCERT_CACHE =
            "popularConcerts";

    private final CacheProperties cacheProperties;

    @Bean
    public RedisCacheManager cacheManager(
            RedisConnectionFactory redisConnectionFactory
    ) {

        /*
         * ============================================================
         * 기본 Redis Cache 설정
         * ============================================================
         *
         * RedisCacheConfiguration 기본 설정은
         * Cache Name prefix를 사용한다.
         *
         * 따라서 실제 Redis Key는:
         *
         * popularConcerts::top10
         *
         * 형태로 저장된다.
         *
         * null 값은 Cache에 저장하지 않는다.
         */
        RedisCacheConfiguration defaultConfiguration =
                RedisCacheConfiguration
                        .defaultCacheConfig()
                        .disableCachingNullValues();


        /*
         * ============================================================
         * 인기 공연 Cache 설정
         * ============================================================
         *
         * TTL은 application.yml의:
         *
         * app.cache.popular-concert.time-to-live
         *
         * 설정값을 사용한다.
         */
        RedisCacheConfiguration
                popularConcertConfiguration =
                defaultConfiguration.entryTtl(
                        cacheProperties
                                .popularConcert()
                                .timeToLive()
                );


        /*
         * ============================================================
         * Redis CacheManager
         * ============================================================
         *
         * popularConcerts Cache를 애플리케이션 시작 시
         * 미리 등록한다.
         *
         * enableStatistics():
         *
         * RedisCache의 local statistics를 활성화한다.
         *
         * Micrometer를 통해 다음과 같은 Metric을
         * 확인할 수 있게 된다.
         *
         * cache_gets_total
         *   result = hit
         *   result = miss
         *
         * cache_puts_total
         *
         * 주의:
         *
         * 이 통계는 Redis Server 전체 통계가 아니라
         * 현재 Spring Boot 인스턴스가 수행한
         * Cache 접근 통계다.
         */
        return RedisCacheManager
                .builder(
                        redisConnectionFactory
                )
                .cacheDefaults(
                        defaultConfiguration
                )
                .withInitialCacheConfigurations(
                        Map.of(
                                POPULAR_CONCERT_CACHE,
                                popularConcertConfiguration
                        )
                )
                .enableStatistics()
                .build();
    }
}
