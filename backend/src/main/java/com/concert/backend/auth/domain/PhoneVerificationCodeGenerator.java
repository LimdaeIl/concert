package com.concert.backend.auth.domain;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class PhoneVerificationCodeGenerator {

    private static final int CODE_BOUND = 1_000_000;

    private final SecureRandom secureRandom = new SecureRandom();

    public String generate() {
        int number = secureRandom.nextInt(CODE_BOUND);

        return String.format("%06d", number);
    }
}
