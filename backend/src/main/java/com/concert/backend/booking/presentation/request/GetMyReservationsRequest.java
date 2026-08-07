package com.concert.backend.booking.presentation.request;

import com.concert.backend.booking.application.condition.ConcertProgress;
import com.concert.backend.booking.application.condition.ReservationSortType;
import com.concert.backend.reservation.domain.ReservationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record GetMyReservationsRequest(

        ReservationStatus status,

        ConcertProgress concertProgress,

        @Size(
                max = 200,
                message = "검색어는 최대 200자까지 입력 가능합니다."
        )
        String keyword,

        LocalDate from,

        LocalDate to,

        ReservationSortType sort,

        @Min(
                value = 0,
                message = "페이지 번호는 0 이상이어야 합니다."
        )
        Integer page,

        @Min(
                value = 1,
                message = "페이지 크기는 1 이상이어야 합니다."
        )
        @Max(
                value = 100,
                message = "페이지 크기는 최대 100입니다."
        )
        Integer size
) {

    public int resolvedPage() {
        return page == null
                ? 0
                : page;
    }

    public int resolvedSize() {
        return size == null
                ? 20
                : size;
    }

    public ReservationSortType resolvedSort() {
        return sort == null
                ? ReservationSortType.RESERVED_AT_DESC
                : sort;
    }

    public String normalizedKeyword() {
        if (keyword == null) {
            return null;
        }

        String normalized = keyword.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}
