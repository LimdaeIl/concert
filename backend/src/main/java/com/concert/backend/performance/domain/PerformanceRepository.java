package com.concert.backend.performance.domain;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PerformanceRepository {

    Performance save(Performance performance);

    Optional<Performance> findById(Long performanceId);

    Optional<Performance> findByIdAndStatusIn(
            Long performanceId,
            Collection<PerformanceStatus> statuses
    );

    List<Performance> findAllByConcertIdAndStatusIn(
            Long concertId,
            Collection<PerformanceStatus> statuses
    );

    boolean existsOverlappingPerformance(
            Long venueHallId,
            LocalDateTime startsAt,
            LocalDateTime endsAt
    );

    boolean existsOverlappingPerformanceAndIdNot(
            Long venueHallId,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            Long performanceId
    );
}
