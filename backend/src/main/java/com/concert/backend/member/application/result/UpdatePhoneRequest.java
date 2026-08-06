package com.concert.backend.member.application.result;

import com.concert.backend.member.application.command.UpdatePhoneCommand;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePhoneRequest(

        @Schema(
                description = "변경할 새 휴대전화번호",
                example = "01012345678"
        )
        @NotBlank
        @Pattern(
                regexp = "^01[016789]\\d{7,8}$",
                message = "유효한 휴대전화번호 형식이어야 합니다."
        )
        String phone,

        @Schema(
                description = "새 휴대전화번호 인증 완료 후 발급된 인증 토큰",
                example = "F3jKp9sY..."
        )
        @NotBlank
        String phoneVerificationToken
) {

    public UpdatePhoneCommand toCommand() {
        return new UpdatePhoneCommand(
                phone,
                phoneVerificationToken
        );
    }
}