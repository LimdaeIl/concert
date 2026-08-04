package com.concert.backend.auth.domain;

import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class PhoneNumberNormalizer {

    private static final Pattern KOREAN_MOBILE_PHONE_PATTERN =
            Pattern.compile("^01[016789]\\d{7,8}$");

    public String normalize(String rawPhone) {
        if (rawPhone == null) {
            throw new AuthException(AuthErrorCode.INVALID_PHONE_NUMBER);
        }

        String normalizedPhone = rawPhone.replaceAll("[^0-9]", "");

        if (!KOREAN_MOBILE_PHONE_PATTERN.matcher(normalizedPhone).matches()) {
            throw new AuthException(AuthErrorCode.INVALID_PHONE_NUMBER);
        }

        return normalizedPhone;
    }
}