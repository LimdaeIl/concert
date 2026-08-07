package com.concert.backend.performance.application;

import com.concert.backend.performance.application.command.UpdatePerformanceSeatCommand;
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
public class UpdatePerformanceSeatService {

    private final PerformanceSeatRepository performanceSeatRepository;

    @Transactional
    public PerformanceSeatResult update(
            Long performanceSeatId,
            UpdatePerformanceSeatCommand command
    ) {
        PerformanceSeat performanceSeat =
                findPerformanceSeat(performanceSeatId);

        performanceSeat.updateInformation(
                command.grade(),
                command.price()
        );

        return PerformanceSeatResult.from(
                performanceSeat
        );
    }

    private PerformanceSeat findPerformanceSeat(
            Long performanceSeatId
    ) {
        return performanceSeatRepository
                .findById(performanceSeatId)
                .orElseThrow(() ->
                        new PerformanceException(
                                PerformanceErrorCode.PERFORMANCE_SEAT_NOT_FOUND
                        )
                );
    }
}

