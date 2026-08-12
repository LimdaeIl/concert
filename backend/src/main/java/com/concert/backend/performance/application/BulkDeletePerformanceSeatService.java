package com.concert.backend.performance.application;

import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BulkDeletePerformanceSeatService {

    private final PerformanceRepository performanceRepository;
    private final PerformanceSeatRepository performanceSeatRepository;

    @Transactional
    public void delete(
            Long performanceId,
            List<Long> performanceSeatIds
    ) {
        validatePerformanceExists(
                performanceId
        );

        validateDuplicateIds(
                performanceSeatIds
        );

        List<PerformanceSeat> performanceSeats =
                performanceSeatRepository
                        .findAllByIdForUpdate(
                                performanceSeatIds
                        );

        validateAllSeatsExist(
                performanceSeatIds,
                performanceSeats
        );

        validateBelongToPerformance(
                performanceId,
                performanceSeats
        );

        performanceSeats.forEach(
                PerformanceSeat::validateDeletable
        );

        performanceSeatRepository.deleteAll(
                performanceSeats
        );
    }

    private void validatePerformanceExists(
            Long performanceId
    ) {
        performanceRepository.findById(
                performanceId
        ).orElseThrow(() ->
                new PerformanceException(
                        PerformanceErrorCode
                                .PERFORMANCE_NOT_FOUND
                )
        );
    }

    private void validateDuplicateIds(
            List<Long> performanceSeatIds
    ) {
        Set<Long> uniqueIds =
                new HashSet<>(
                        performanceSeatIds
                );

        if (uniqueIds.size()
                != performanceSeatIds.size()) {
            throw new PerformanceException(
                    PerformanceErrorCode
                            .DUPLICATE_PERFORMANCE_SEAT
            );
        }
    }

    private void validateAllSeatsExist(
            List<Long> requestedIds,
            List<PerformanceSeat> performanceSeats
    ) {
        if (requestedIds.size()
                != performanceSeats.size()) {
            throw new PerformanceException(
                    PerformanceErrorCode
                            .PERFORMANCE_SEAT_NOT_FOUND
            );
        }
    }

    private void validateBelongToPerformance(
            Long performanceId,
            List<PerformanceSeat> performanceSeats
    ) {
        boolean containsInvalidSeat =
                performanceSeats.stream()
                        .anyMatch(
                                performanceSeat ->
                                        !performanceSeat
                                                .getPerformance()
                                                .getId()
                                                .equals(
                                                        performanceId
                                                )
                        );

        if (containsInvalidSeat) {
            throw new PerformanceException(
                    PerformanceErrorCode
                            .PERFORMANCE_SEAT_NOT_FOUND
            );
        }
    }
}
