package com.concert.backend.performance.application;

import com.concert.backend.performance.application.command.UpdatePerformanceStatusCommand;
import com.concert.backend.performance.application.result.PerformanceResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdatePerformanceStatusService {

    private final PerformanceRepository performanceRepository;

    @Transactional
    public PerformanceResult updateStatus(
            Long performanceId,
            UpdatePerformanceStatusCommand command
    ) {
        Performance performance = performanceRepository
                .findById(performanceId)
                .orElseThrow(() ->
                        new PerformanceException(
                                PerformanceErrorCode.PERFORMANCE_NOT_FOUND
                        )
                );

        performance.changeStatus(command.status());

        return PerformanceResult.from(performance);
    }
}
