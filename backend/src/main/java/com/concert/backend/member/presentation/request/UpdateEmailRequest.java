package com.concert.backend.member.presentation.request;

import com.concert.backend.member.application.command.UpdateEmailCommand;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateEmailRequest(

        @Schema(
                description = "변경할 새 이메일",
                example = "new-email@example.com"
        )
        @NotBlank
        @Email
        @Size(max = 100)
        String email,

        @Schema(
                description = "새 이메일 인증 완료 후 발급된 인증 토큰"
        )
        @NotBlank
        String emailVerificationToken
) {

    public UpdateEmailCommand toCommand() {
        return new UpdateEmailCommand(
                email,
                emailVerificationToken
        );
    }
}
