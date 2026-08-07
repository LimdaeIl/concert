package com.concert.backend.concert.presentation.request;

import com.concert.backend.concert.application.command.UpdateConcertCommand;
import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.ConcertCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateConcertRequest(

        @NotBlank
        @Size(max = 200)
        String title,

        @Size(max = 200)
        String subtitle,

        String description,

        @NotNull
        ConcertCategory category,

        @Min(1)
        Integer runningTime,

        @NotNull
        AgeRating ageRating,

        @Size(max = 500)
        String posterUrl
) {

    public UpdateConcertCommand toCommand() {
        return new UpdateConcertCommand(
                title,
                subtitle,
                description,
                category,
                runningTime,
                ageRating,
                posterUrl
        );
    }
}
