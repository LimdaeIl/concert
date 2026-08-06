package com.concert.backend.member.presentation.request;

import com.concert.backend.member.application.command.SocialSignUpCommand;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record SocialSignUpRequest(

        @Schema(
                description = "OAuth 신규 사용자에게 발급된 가입 티켓"
        )
        @NotBlank
        String ticket,

        @Schema(
                description = "휴대전화번호",
                example = "01012345678"
        )
        @NotBlank
        String phone,

        @Schema(
                description = "휴대전화 인증 완료 후 발급된 토큰"
        )
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
