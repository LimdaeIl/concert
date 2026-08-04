package com.concert.backend.auth.domain;

import java.util.Optional;

public interface EmailVerificationRepository {

    void saveCode(String email, String verificationCode);

    Optional<String> findCode(String email);

    void deleteCode(String email);

    void saveVerificationToken(String verificationToken, String email);

    Optional<String> findEmailByVerificationToken(String verificationToken);

    void deleteVerificationToken(String verificationToken);

    long incrementFailedAttempts(String email);

    void deleteFailedAttempts(String email);
}
