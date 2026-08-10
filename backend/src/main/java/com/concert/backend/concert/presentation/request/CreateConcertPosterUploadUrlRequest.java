package com.concert.backend.concert.presentation.request;

import jakarta.validation.constraints.NotBlank;

public record CreateConcertPosterUploadUrlRequest(

        @NotBlank
        String contentType

) {
}
