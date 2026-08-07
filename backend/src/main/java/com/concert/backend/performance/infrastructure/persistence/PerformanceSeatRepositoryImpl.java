package com.concert.backend.performance.infrastructure.persistence;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.infrastructure.jpa.JpaPerformanceSeatRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class PerformanceSeatRepositoryImpl
        implements PerformanceSeatRepository {

    private final JpaPerformanceSeatRepository
            jpaPerformanceSeatRepository;

    @Override
    public List<PerformanceSeat> saveAll(
            List<PerformanceSeat> performanceSeats
    ) {
        return jpaPerformanceSeatRepository.saveAll(
                performanceSeats
        );
    }

    @Override
    public Optional<PerformanceSeat> findById(
            Long performanceSeatId
    ) {
        return jpaPerformanceSeatRepository.findById(
                performanceSeatId
        );
    }

    @Override
    public List<PerformanceSeat> findAllByPerformanceId(
            Long performanceId
    ) {
        return jpaPerformanceSeatRepository
                .findAllByPerformance_IdOrderBySeat_IdAsc(
                        performanceId
                );
    }

    @Override
    public List<PerformanceSeat>
    findAllByPerformanceIdAndStatus(
            Long performanceId,
            PerformanceSeatStatus status
    ) {
        return jpaPerformanceSeatRepository
                .findAllByPerformance_IdAndStatusOrderBySeat_IdAsc(
                        performanceId,
                        status
                );
    }

    @Override
    public boolean existsByPerformanceIdAndSeatId(
            Long performanceId,
            Long seatId
    ) {
        return jpaPerformanceSeatRepository
                .existsByPerformance_IdAndSeat_Id(
                        performanceId,
                        seatId
                );
    }
}
