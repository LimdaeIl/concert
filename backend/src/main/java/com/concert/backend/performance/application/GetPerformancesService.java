package com.concert.backend.performance.application;

import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import com.concert.backend.performance.application.result.PerformanceResult;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetPerformancesService {

    private static final Set<PerformanceStatus>
            PUBLIC_STATUSES = Set.of(
            PerformanceStatus.SCHEDULED,
            PerformanceStatus.OPEN,
            PerformanceStatus.SOLD_OUT
    );

    private final ConcertRepository concertRepository;
    private final PerformanceRepository performanceRepository;

    @Transactional(readOnly = true)
    public List<PerformanceResult> getPerformances(
            Long concertId
    ) {
        concertRepository.findByIdAndStatus(
                        concertId,
                        ConcertStatus.PUBLISHED
                )
                .orElseThrow(() ->
                        new ConcertException(
                                ConcertErrorCode.CONCERT_NOT_FOUND
                        )
                );

        return performanceRepository
                .findAllByConcertIdAndStatusIn(
                        concertId,
                        PUBLIC_STATUSES
                )
                .stream()
                .map(PerformanceResult::from)
                .toList();
    }
}
