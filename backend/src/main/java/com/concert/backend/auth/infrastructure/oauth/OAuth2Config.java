package com.concert.backend.auth.infrastructure.oauth;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        OAuth2CookieProperties.class,
        OAuth2FlowProperties.class
})
public class OAuth2Config {
}
