package com.concert.backend.concert.presentation.request;

import com.concert.backend.concert.application.command.CreateConcertCommand;
import com.concert.backend.concert.domain.AgeRating;
import com.concert.backend.concert.domain.ConcertCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateConcertRequest(

        @NotBlank(
                message =
                        "공연 제목은 필수입니다."
        )
        @Size(
                max = 200,
                message =
                        "공연 제목은 최대 200자까지 입력 가능합니다."
        )
        String title,

        @Size(max = 200)
        String subtitle,

        String description,

        @NotNull(
                message =
                        "공연 카테고리는 필수입니다."
        )
        ConcertCategory category,

        @Min(
                value = 1,
                message =
                        "공연 시간은 1분 이상이어야 합니다."
        )
        Integer runningTime,

        @NotNull(
                message =
                        "관람 등급은 필수입니다."
        )
        AgeRating ageRating

) {

    public CreateConcertCommand toCommand() {
        return new CreateConcertCommand(
                title,
                subtitle,
                description,
                category,
                runningTime,
                ageRating
        );
    }
}
