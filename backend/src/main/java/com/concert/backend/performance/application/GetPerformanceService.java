package com.concert.backend.performance.application;

import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import com.concert.backend.performance.application.result.PerformanceResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetPerformanceService {

    private static final Set<PerformanceStatus>
            PUBLIC_STATUSES = Set.of(
            PerformanceStatus.SCHEDULED,
            PerformanceStatus.OPEN,
            PerformanceStatus.SOLD_OUT
    );

    private final ConcertRepository concertRepository;
    private final PerformanceRepository performanceRepository;

    @Transactional(readOnly = true)
    public PerformanceResult getPerformance(
            Long performanceId
    ) {
        Performance performance = performanceRepository
                .findByIdAndStatusIn(
                        performanceId,
                        PUBLIC_STATUSES
                )
                .orElseThrow(() ->
                        new PerformanceException(
                                PerformanceErrorCode.PERFORMANCE_NOT_FOUND
                        )
                );

        concertRepository.findByIdAndStatus(
                        performance.getConcertId(),
                        ConcertStatus.PUBLISHED
                )
                .orElseThrow(() ->
                        new ConcertException(
                                ConcertErrorCode.CONCERT_NOT_FOUND
                        )
                );

        return PerformanceResult.from(performance);
    }
}
