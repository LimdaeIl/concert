package com.concert.backend.performance.query;

import com.concert.backend.performance.domain.PerformanceStatus;
import java.time.LocalDateTime;

public record AdminPerformanceSearchCondition(
        Long concertId,
        PerformanceStatus status,
        LocalDateTime from,
        LocalDateTime to,
        int size,
        long offset
) {
}
