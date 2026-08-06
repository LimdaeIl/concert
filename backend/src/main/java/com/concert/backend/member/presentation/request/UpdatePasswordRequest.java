package com.concert.backend.member.presentation.request;

import com.concert.backend.member.application.command.UpdatePasswordCommand;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePasswordRequest(

        @Schema(
                description = "현재 비밀번호",
                example = "CurrentPassword1!"
        )
        @NotBlank
        String currentPassword,

        @Schema(
                description = "새 비밀번호",
                example = "NewPassword1!"
        )
        @NotBlank
        @Size(min = 8, max = 64)
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$",
                message = "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다."
        )
        String newPassword
) {

    public UpdatePasswordCommand toCommand() {
        return new UpdatePasswordCommand(
                currentPassword,
                newPassword
        );
    }
}
