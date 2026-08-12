package com.concert.backend.performance.domain;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PerformanceSeatRepository {

    List<PerformanceSeat> saveAll(
            List<PerformanceSeat> performanceSeats
    );

    Optional<PerformanceSeat> findById(Long performanceSeatId);

    List<PerformanceSeat> findAllByPerformanceId(
            Long performanceId
    );

    boolean existsByPerformanceIdAndSeatId(
            Long performanceId,
            Long seatId
    );

    List<PerformanceSeat> findAllById(Collection<Long> performanceSeatIds);

    List<PerformanceSeat> findAllByIdForUpdate(
            Collection<Long> performanceSeatIds
    );

    void deleteAll(Collection<PerformanceSeat> performanceSeats);

    boolean existsBySeatIdIn(Collection<Long> seatIds);

    long countByPerformanceId(Long performanceId);


}
