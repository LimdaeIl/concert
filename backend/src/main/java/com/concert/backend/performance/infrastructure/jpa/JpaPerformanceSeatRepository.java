package com.concert.backend.performance.infrastructure.jpa;

import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatStatus;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /*
     * 예약 좌석 선점 전용.
     *
     * MySQL에서는 대략:
     *
     * SELECT ...
     * FROM v1_performance_seats
     * WHERE id IN (...)
     * FOR UPDATE
     *
     * 형태로 실행된다.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select ps
            from PerformanceSeat ps
            where ps.id in :ids
            order by ps.id asc
            """)
    List<PerformanceSeat> findAllByIdForUpdate(
            @Param("ids")
            Collection<Long> ids
    );
}
