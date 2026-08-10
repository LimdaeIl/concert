package com.concert.backend.performance.application;

import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidatePageResult;
import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidateResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.performance.query.AdminPerformanceSeatCandidateCondition;
import com.concert.backend.performance.query.AdminPerformanceSeatCandidateQueryMapper;
import com.concert.backend.performance.query.AdminPerformanceSeatCandidateRow;
import com.concert.backend.venuehall.domain.SeatType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminPerformanceSeatCandidatesService {

    private final PerformanceRepository
            performanceRepository;

    private final AdminPerformanceSeatCandidateQueryMapper
            queryMapper;

    @Transactional(readOnly = true)
    public AdminPerformanceSeatCandidatePageResult getCandidates(
            Long performanceId,
            String keyword,
            Short floor,
            SeatType seatType,
            int page,
            int size
    ) {
        Performance performance =
                performanceRepository
                        .findById(performanceId)
                        .orElseThrow(() ->
                                new PerformanceException(
                                        PerformanceErrorCode
                                                .PERFORMANCE_NOT_FOUND
                                )
                        );

        /*
         * 신규 판매좌석 추가 자체가
         * SCHEDULED 회차에서만 가능하다.
         */
        if (performance.getStatus()
                != PerformanceStatus.SCHEDULED) {

            throw new PerformanceException(
                    PerformanceErrorCode
                            .PERFORMANCE_NOT_AVAILABLE_FOR_SEAT_CONFIGURATION
            );
        }

        String normalizedKeyword =
                normalizeKeyword(
                        keyword
                );

        long offset =
                (long) page * size;

        AdminPerformanceSeatCandidateCondition condition =
                new AdminPerformanceSeatCandidateCondition(
                        performanceId,
                        performance.getVenueHallId(),
                        normalizedKeyword,
                        floor,
                        seatType,
                        size,
                        offset
                );

        long totalElements =
                queryMapper.count(
                        condition
                );

        List<AdminPerformanceSeatCandidateResult> seats;

        if (totalElements == 0
                || offset >= totalElements) {

            seats = List.of();

        } else {
            List<AdminPerformanceSeatCandidateRow> rows =
                    queryMapper.findAll(
                            condition
                    );

            seats =
                    rows.stream()
                            .map(
                                    AdminPerformanceSeatCandidateResult::from
                            )
                            .toList();
        }

        return AdminPerformanceSeatCandidatePageResult.of(
                performanceId,
                performance.getVenueHallId(),
                seats,
                page,
                size,
                totalElements
        );
    }

    private String normalizeKeyword(
            String keyword
    ) {
        if (keyword == null) {
            return null;
        }

        String normalized =
                keyword.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}
