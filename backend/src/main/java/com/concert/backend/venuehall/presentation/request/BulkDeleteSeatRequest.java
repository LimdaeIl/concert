package com.concert.backend.venuehall.presentation.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record BulkDeleteSeatRequest(

        @NotEmpty List<@NotNull @Positive Long> seatIds

) {
}
