package com.concert.backend.auth.infrastructure.sms;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.service.DefaultMessageService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SolapiProperties.class)
public class SolapiConfig {

    @Bean
    public DefaultMessageService solapiMessageService(SolapiProperties properties
    ) {
        return SolapiClient.INSTANCE.createInstance(properties.apiKey(), properties.apiSecret());
    }
}
