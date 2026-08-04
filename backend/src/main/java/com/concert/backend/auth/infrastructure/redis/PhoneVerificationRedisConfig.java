package com.concert.backend.auth.infrastructure.redis;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(PhoneVerificationProperties.class)
public class PhoneVerificationRedisConfig {
}
