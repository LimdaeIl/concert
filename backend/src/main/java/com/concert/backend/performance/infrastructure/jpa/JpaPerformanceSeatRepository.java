package com.concert.backend.performance.infrastructure.jpa;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaPerformanceSeatRepository
        extends JpaRepository<PerformanceSeat, Long> {

    List<PerformanceSeat>
    findAllByPerformance_IdOrderBySeat_IdAsc(
            Long performanceId
    );

    List<PerformanceSeat>
    findAllByPerformance_IdAndStatusOrderBySeat_IdAsc(
            Long performanceId,
            PerformanceSeatStatus status
    );

    boolean existsByPerformance_IdAndSeat_Id(
            Long performanceId,
            Long seatId
    );
}
