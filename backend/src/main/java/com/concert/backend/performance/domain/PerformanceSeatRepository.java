package com.concert.backend.performance.domain;

import java.util.List;
import java.util.Optional;

public interface PerformanceSeatRepository {

    List<PerformanceSeat> saveAll(
            List<PerformanceSeat> performanceSeats
    );

    Optional<PerformanceSeat> findById(
            Long performanceSeatId
    );

    List<PerformanceSeat> findAllByPerformanceId(
            Long performanceId
    );

    List<PerformanceSeat>
    findAllByPerformanceIdAndStatus(
            Long performanceId,
            PerformanceSeatStatus status
    );

    boolean existsByPerformanceIdAndSeatId(
            Long performanceId,
            Long seatId
    );
}
