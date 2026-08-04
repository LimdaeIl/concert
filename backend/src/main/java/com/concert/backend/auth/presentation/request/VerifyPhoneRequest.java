package com.concert.backend.auth.presentation.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyPhoneRequest(

        @NotBlank(message = "휴대전화번호는 필수 입력값입니다.")
        @Pattern(
                regexp = "^01[016789]\\d{7,8}$",
                message = "올바른 휴대전화번호 형식이 아닙니다. (예: 01012345678)"
        )
        String phone,

        @NotBlank(message = "휴대전화 인증번호는 필수 입력값입니다.")
        @Pattern(
                regexp = "^\\d{6}$",
                message = "휴대전화 인증번호는 6자리 숫자여야 합니다."
        )
        String verificationCode
) {
}
