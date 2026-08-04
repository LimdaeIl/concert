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
        @NotBlank
        @Email
        @Size(max = 100)
        String email,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        @NotBlank
        @Size(max = 50)
        String name,

        @NotBlank
        @Pattern(regexp = "^01[016789]\\d{7,8}$")
        String phone,

        @NotBlank
        @Size(max = 255)
        String roadAddress,

        @Size(max = 255)
        String jibunAddress,

        @Size(max = 255)
        String detailAddress,

        @Size(max = 10)
        String zipCode,

        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        BigDecimal latitude,

        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        BigDecimal longitude
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
                longitude
        );
    }
}
