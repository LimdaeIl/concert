package com.concert.backend.member.presentation.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileImageRequest(

        @NotBlank
        String objectKey

) {
}
