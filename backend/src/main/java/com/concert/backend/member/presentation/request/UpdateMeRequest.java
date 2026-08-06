package com.concert.backend.member.presentation.request;

import com.concert.backend.member.application.command.UpdateMeCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateMeRequest(

        @NotBlank
        @Size(max = 50)
        String name,

        @NotBlank
        @Size(max = 255)
        String roadAddress,

        @Size(max = 255)
        String jibunAddress,

        @Size(max = 255)
        String detailAddress,

        @Size(max = 10)
        String zipCode,

        BigDecimal latitude,

        BigDecimal longitude
) {

    public UpdateMeCommand toCommand() {
        return new UpdateMeCommand(
                name,
                roadAddress,
                jibunAddress,
                detailAddress,
                zipCode,
                latitude,
                longitude
        );
    }
}
