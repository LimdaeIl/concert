package com.concert.backend.performance.application;

import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidateMapResult;
import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidateMapSeatResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.performance.query.AdminPerformanceSeatCandidateMapQueryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminPerformanceSeatCandidateMapService {

    private final PerformanceRepository
            performanceRepository;

    private final AdminPerformanceSeatCandidateMapQueryMapper
            candidateMapQueryMapper;

    @Transactional(readOnly = true)
    public AdminPerformanceSeatCandidateMapResult getCandidateMap(
            Long performanceId
    ) {
        Performance performance =
                getPerformance(
                        performanceId
                );

        validateConfigurable(
                performance
        );

        var seats =
                candidateMapQueryMapper
                        .findAll(
                                performance.getId(),
                                performance.getVenueHallId()
                        )
                        .stream()
                        .map(
                                AdminPerformanceSeatCandidateMapSeatResult::from
                        )
                        .toList();

        return AdminPerformanceSeatCandidateMapResult.of(
                performance.getId(),
                performance.getVenueHallId(),
                performance.getStatus(),
                seats
        );
    }

    private Performance getPerformance(
            Long performanceId
    ) {
        if (performanceId == null
                || performanceId <= 0) {

            throw new PerformanceException(
                    PerformanceErrorCode
                            .PERFORMANCE_NOT_FOUND
            );
        }

        return performanceRepository
                .findById(
                        performanceId
                )
                .orElseThrow(() ->
                        new PerformanceException(
                                PerformanceErrorCode
                                        .PERFORMANCE_NOT_FOUND
                        )
                );
    }

    private void validateConfigurable(
            Performance performance
    ) {
        if (performance.getStatus()
                != PerformanceStatus.SCHEDULED) {

            throw new PerformanceException(
                    PerformanceErrorCode
                            .PERFORMANCE_SEAT_CONFIGURATION_NOT_ALLOWED
            );
        }
    }
}
