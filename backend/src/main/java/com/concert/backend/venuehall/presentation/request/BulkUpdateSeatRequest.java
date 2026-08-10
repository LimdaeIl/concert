package com.concert.backend.venuehall.presentation.request;

import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BulkUpdateSeatRequest(

        @NotEmpty
        @Size(max = 500)
        List<Long> seatIds,

        SeatType seatType,

        SeatStatus status

) {
}
