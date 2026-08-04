package com.concert.backend.auth.domain;

import java.util.Optional;

public interface PhoneVerificationRepository {

    void saveCode(String phone, String verificationCode);

    Optional<String> findCode(String phone);

    void deleteCode(String phone);

    long incrementFailedAttempts(String phone);

    void deleteFailedAttempts(String phone);

    void saveVerificationToken(String verificationToken, String phone);

    Optional<String> findPhoneByVerificationToken(String verificationToken);

    void deleteVerificationToken(String verificationToken);
}
