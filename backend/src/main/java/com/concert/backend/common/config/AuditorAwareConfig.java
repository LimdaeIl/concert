package com.concert.backend.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

@Configuration
public class AuditorAwareConfig {

    @Bean
    public AuditorAware<Long> auditorAware() {
         // todo: Spring Security 적용 후 SecurityContext에서 로그인 회원 ID를 반환하도록 교체 예정
        return Optional::empty;
    }
}
