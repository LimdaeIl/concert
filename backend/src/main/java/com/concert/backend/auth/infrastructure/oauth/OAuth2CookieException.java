package com.concert.backend.auth.infrastructure.oauth;

public class OAuth2CookieException extends RuntimeException {

    public OAuth2CookieException(String message) {
        super(message);
    }

    public OAuth2CookieException(String message, Throwable cause) {
        super(message, cause);
    }
}
