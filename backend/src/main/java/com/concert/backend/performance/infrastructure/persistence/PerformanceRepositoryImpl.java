package com.concert.backend.performance.infrastructure.persistence;

import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.infrastructure.jpa.JpaPerformanceRepository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class PerformanceRepositoryImpl
        implements PerformanceRepository {

    private final JpaPerformanceRepository jpaPerformanceRepository;

    @Override
    public Performance save(Performance performance) {
        return jpaPerformanceRepository.save(performance);
    }

    @Override
    public Optional<Performance> findById(
            Long performanceId
    ) {
        return jpaPerformanceRepository.findById(performanceId);
    }

    @Override
    public Optional<Performance> findByIdAndStatusIn(
            Long performanceId,
            Collection<PerformanceStatus> statuses
    ) {
        return jpaPerformanceRepository.findByIdAndStatusIn(
                performanceId,
                statuses
        );
    }

    @Override
    public List<Performance> findAllByConcertIdAndStatusIn(
            Long concertId,
            Collection<PerformanceStatus> statuses
    ) {
        return jpaPerformanceRepository
                .findAllByConcertIdAndStatusInOrderByStartsAtAsc(
                        concertId,
                        statuses
                );
    }

    @Override
    public boolean existsOverlappingPerformance(
            Long venueHallId,
            LocalDateTime startsAt,
            LocalDateTime endsAt
    ) {
        return jpaPerformanceRepository
                .existsOverlappingPerformance(
                        venueHallId,
                        startsAt,
                        endsAt
                );
    }

    @Override
    public boolean existsOverlappingPerformanceAndIdNot(
            Long venueHallId,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            Long performanceId
    ) {
        return jpaPerformanceRepository
                .existsOverlappingPerformanceAndIdNot(
                        venueHallId,
                        startsAt,
                        endsAt,
                        performanceId
                );
    }
}
