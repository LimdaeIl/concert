package com.concert.backend.performance.application;

import com.concert.backend.performance.application.result.PerformanceSeatResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetPerformanceSeatsService {

    private static final Set<PerformanceStatus>
            PUBLIC_STATUSES = Set.of(
            PerformanceStatus.SCHEDULED,
            PerformanceStatus.OPEN,
            PerformanceStatus.SOLD_OUT
    );

    private final PerformanceRepository performanceRepository;
    private final PerformanceSeatRepository performanceSeatRepository;

    @Transactional(readOnly = true)
    public List<PerformanceSeatResult> getSeats(
            Long performanceId
    ) {
        Performance performance =
                performanceRepository
                        .findByIdAndStatusIn(
                                performanceId,
                                PUBLIC_STATUSES
                        )
                        .orElseThrow(() ->
                                new PerformanceException(
                                        PerformanceErrorCode.PERFORMANCE_NOT_FOUND
                                )
                        );

        return performanceSeatRepository
                .findAllByPerformanceId(
                        performance.getId()
                )
                .stream()
                .map(PerformanceSeatResult::from)
                .toList();
    }
}
