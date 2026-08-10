package com.concert.backend.concert.query;

import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.domain.ConcertStatus;

public record AdminConcertSearchCondition(
        String keyword,
        ConcertCategory category,
        ConcertStatus status,
        int size,
        long offset
) {
}

