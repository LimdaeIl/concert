package com.concert.backend.auth.infrastructure.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SecurityEndpoints {

    public static final String[] AUTH_PUBLIC = {
            "/api/v1/auth/**",
            "/api/v1/members/sign-up"
    };

    public static final String[] API_DOCS_PUBLIC = {
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/webjars/**",
            "/docs/**"
    };

    public static final String[] SYSTEM_PUBLIC = {
            "/error"
    };
}

