package com.concert.backend.payment.infrastructure.toss;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(
        TossPaymentsProperties.class
)
public class TossPaymentsConfig {

    @Bean("tossPaymentsRestClient")
    public RestClient tossPaymentsRestClient(
            TossPaymentsProperties properties
    ) {
        String credentials =
                properties.secretKey() + ":";

        String encodedCredentials =
                Base64.getEncoder()
                        .encodeToString(
                                credentials.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );

        return RestClient.builder()
                .baseUrl(properties.apiUrl())
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Basic " + encodedCredentials
                )
                .defaultHeader(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }
}
