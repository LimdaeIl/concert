package com.concert.backend.auth.infrastructure.security;

import com.concert.backend.auth.infrastructure.oauth.CookieOAuth2AuthorizationRequestRepository;
import com.concert.backend.auth.infrastructure.oauth.OAuth2AuthenticationFailureHandler;
import com.concert.backend.auth.infrastructure.oauth.OAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private final CookieOAuth2AuthorizationRequestRepository
            cookieOAuth2AuthorizationRequestRepository;

    private final OAuth2AuthenticationSuccessHandler
            oauth2AuthenticationSuccessHandler;

    private final OAuth2AuthenticationFailureHandler
            oauth2AuthenticationFailureHandler;


    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                jwtAuthenticationEntryPoint
                        )
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        .requestMatchers(
                                "/oauth2/authorization/**",
                                "/login/oauth2/code/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/sign-in",
                                "/api/v1/auth/reissue",
                                "/api/v1/auth/sign-out",
                                "/api/v1/auth/oauth/exchange"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/members/sign-up",
                                "/api/v1/members/social-sign-up"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/email-verifications",
                                "/api/v1/auth/email-verifications/verify"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/phone-verifications",
                                "/api/v1/auth/phone-verifications/verify"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/venues",
                                "/api/v1/venues/**"
                        ).permitAll()

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        .requestMatchers(
                                "/actuator/health",
                                "/error"
                        ).permitAll()

                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(endpoint -> endpoint
                                .authorizationRequestRepository(
                                        cookieOAuth2AuthorizationRequestRepository
                                )
                        )
                        .successHandler(oauth2AuthenticationSuccessHandler)
                        .failureHandler(oauth2AuthenticationFailureHandler)
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }
}
