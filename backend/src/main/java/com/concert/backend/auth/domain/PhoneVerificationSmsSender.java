package com.concert.backend.auth.domain;

public interface PhoneVerificationSmsSender {

    void send(String phone, String verificationCode);
}
