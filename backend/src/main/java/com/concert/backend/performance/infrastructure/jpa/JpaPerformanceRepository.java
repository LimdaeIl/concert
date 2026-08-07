package com.concert.backend.performance.infrastructure.jpa;

import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JpaPerformanceRepository
        extends JpaRepository<Performance, Long> {

    Optional<Performance> findByIdAndStatusIn(
            Long id,
            Collection<PerformanceStatus> statuses
    );

    List<Performance>
    findAllByConcertIdAndStatusInOrderByStartsAtAsc(
            Long concertId,
            Collection<PerformanceStatus> statuses
    );

    @Query("""
            select count(p) > 0
            from Performance p
            where p.venueHallId = :venueHallId
              and p.status <> com.concert.backend.performance.domain.PerformanceStatus.CANCELLED
              and p.startsAt < :endsAt
              and p.endsAt > :startsAt
            """)
    boolean existsOverlappingPerformance(
            @Param("venueHallId") Long venueHallId,
            @Param("startsAt") LocalDateTime startsAt,
            @Param("endsAt") LocalDateTime endsAt
    );

    @Query("""
            select count(p) > 0
            from Performance p
            where p.venueHallId = :venueHallId
              and p.id <> :performanceId
              and p.status <> com.concert.backend.performance.domain.PerformanceStatus.CANCELLED
              and p.startsAt < :endsAt
              and p.endsAt > :startsAt
            """)
    boolean existsOverlappingPerformanceAndIdNot(
            @Param("venueHallId") Long venueHallId,
            @Param("startsAt") LocalDateTime startsAt,
            @Param("endsAt") LocalDateTime endsAt,
            @Param("performanceId") Long performanceId
    );
}
