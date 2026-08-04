package com.concert.backend.auth.infrastructure.mail;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public record MailProperties(
        String sender
) {
}
