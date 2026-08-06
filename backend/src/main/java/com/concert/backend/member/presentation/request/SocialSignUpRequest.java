package com.concert.backend.member.presentation.request;

import com.concert.backend.member.application.command.SocialSignUpCommand;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record SocialSignUpRequest(

        @NotBlank
        String ticket,

        @NotBlank
        String phone,

        @NotBlank
        String phoneVerificationToken,

        @NotBlank
        String roadAddress,

        String jibunAddress,

        String detailAddress,

        String zipCode,

        BigDecimal latitude,

        BigDecimal longitude
) {

    public SocialSignUpCommand toCommand() {
        return new SocialSignUpCommand(
                ticket,
                phone,
                phoneVerificationToken,
                roadAddress,
                jibunAddress,
                detailAddress,
                zipCode,
                latitude,
                longitude
        );
    }
}
