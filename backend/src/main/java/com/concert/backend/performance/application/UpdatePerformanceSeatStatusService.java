package com.concert.backend.performance.application;

import com.concert.backend.performance.application.command.UpdatePerformanceSeatStatusCommand;
import com.concert.backend.performance.application.result.PerformanceSeatResult;
import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdatePerformanceSeatStatusService {

    private final PerformanceSeatRepository performanceSeatRepository;

    @Transactional
    public PerformanceSeatResult updateStatus(
            Long performanceSeatId,
            UpdatePerformanceSeatStatusCommand command
    ) {
        PerformanceSeat performanceSeat =
                performanceSeatRepository
                        .findById(performanceSeatId)
                        .orElseThrow(() ->
                                new PerformanceException(
                                        PerformanceErrorCode.PERFORMANCE_SEAT_NOT_FOUND
                                )
                        );

        performanceSeat.changeAdministrativeStatus(
                command.status()
        );

        return PerformanceSeatResult.from(
                performanceSeat
        );
    }
}
