package com.concert.backend.performance.presentation.request;

import com.concert.backend.performance.application.command.CreatePerformanceSeatCommand;
import com.concert.backend.performance.domain.SeatGrade;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkCreatePerformanceSeatRequest(

        @NotEmpty(message = "등록할 공연 좌석이 필요합니다.")
        @Valid
        List<Item> seats
) {

    public List<CreatePerformanceSeatCommand> toCommands() {
        return seats.stream()
                .map(Item::toCommand)
                .toList();
    }

    public record Item(

            @NotNull
            Long seatId,

            @NotNull
            SeatGrade grade,

            @NotNull
            @Min(0)
            Long price
    ) {

        public CreatePerformanceSeatCommand toCommand() {
            return new CreatePerformanceSeatCommand(
                    seatId,
                    grade,
                    price
            );
        }
    }
}
