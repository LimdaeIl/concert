package com.concert.backend.member.presentation.request;

import com.concert.backend.member.application.command.SignUpCommand;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record SignUpRequest(
        @NotBlank(message = "이메일은 필수 입력값입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 100, message = "이메일은 최대 100자까지 입력 가능합니다.")
        String email,

        @NotBlank(message = "비밀번호는 필수 입력값입니다.")
        @Size(min = 8, max = 100, message = "비밀번호는 8자 이상 100자 이하로 입력해 주세요.")
        String password,

        @NotBlank(message = "이름은 필수 입력값입니다.")
        @Size(max = 50, message = "이름은 최대 50자까지 입력 가능합니다.")
        String name,

        @NotBlank(message = "전화번호는 필수 입력값입니다.")
        @Pattern(regexp = "^01[016789]\\d{7,8}$", message = "올바른 휴대폰 번호 형식이 아닙니다. (예: 01012345678)")
        String phone,

        @NotBlank(message = "도로명 주소는 필수 입력값입니다.")
        @Size(max = 255, message = "도로명 주소는 최대 255자까지 입력 가능합니다.")
        String roadAddress,

        @Size(max = 255, message = "지번 주소는 최대 255자까지 입력 가능합니다.")
        String jibunAddress,

        @Size(max = 255, message = "상세 주소는 최대 255자까지 입력 가능합니다.")
        String detailAddress,

        @Size(max = 10, message = "우편번호는 최대 10자까지 입력 가능합니다.")
        String zipCode,

        @DecimalMin(value = "-90.0", message = "위도는 -90.0 이상이어야 합니다.")
        @DecimalMax(value = "90.0", message = "위도는 90.0 이하이어야 합니다.")
        BigDecimal latitude,

        @DecimalMin(value = "-180.0", message = "경도는 -180.0 이상이어야 합니다.")
        @DecimalMax(value = "180.0", message = "경도는 180.0 이하이어야 합니다.")
        BigDecimal longitude,

        @NotBlank(message = "이메일 인증 토큰은 필수입니다.")
        String emailVerificationToken,

        @NotBlank(message = "휴대전화 인증 토큰은 필수입니다.")
        String phoneVerificationToken

) {

    public SignUpCommand toCommand() {
        return new SignUpCommand(
                email,
                password,
                name,
                phone,
                roadAddress,
                jibunAddress,
                detailAddress,
                zipCode,
                latitude,
                longitude,
                emailVerificationToken,
                phoneVerificationToken
        );
    }
}
