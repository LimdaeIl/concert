package com.concert.backend.concert.presentation.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateConcertPosterRequest(

        @NotBlank
        String objectKey

) {
}
