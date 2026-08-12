package com.concert.backend.performance.presentation.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkDeletePerformanceSeatRequest(

        @NotEmpty
        List<@NotNull Long> performanceSeatIds

) {
}
