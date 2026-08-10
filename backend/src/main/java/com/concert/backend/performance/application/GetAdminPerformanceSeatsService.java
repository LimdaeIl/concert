package com.concert.backend.performance.application;

import com.concert.backend.performance.application.result.AdminPerformanceSeatPageResult;
import com.concert.backend.performance.application.result.AdminPerformanceSeatResult;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.performance.query.AdminPerformanceSeatQueryMapper;
import com.concert.backend.performance.query.AdminPerformanceSeatQueryRow;
import com.concert.backend.performance.query.AdminPerformanceSeatSearchCondition;
import com.concert.backend.venuehall.domain.SeatType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminPerformanceSeatsService {

    private final PerformanceRepository performanceRepository;

    private final AdminPerformanceSeatQueryMapper
            adminPerformanceSeatQueryMapper;

    @Transactional(readOnly = true)
    public AdminPerformanceSeatPageResult getSeats(
            Long performanceId,
            String keyword,
            Short floor,
            SeatGrade grade,
            SeatType seatType,
            PerformanceSeatStatus status,
            int page,
            int size
    ) {
        validatePerformanceExists(
                performanceId
        );

        String normalizedKeyword =
                normalizeKeyword(
                        keyword
                );

        long offset =
                (long) page * size;

        AdminPerformanceSeatSearchCondition condition =
                new AdminPerformanceSeatSearchCondition(
                        performanceId,
                        normalizedKeyword,
                        floor,
                        grade,
                        seatType,
                        status,
                        size,
                        offset
                );

        long totalElements =
                adminPerformanceSeatQueryMapper
                        .count(
                                condition
                        );

        List<AdminPerformanceSeatResult> seats;

        if (totalElements == 0
                || offset >= totalElements) {

            seats = List.of();

        } else {
            List<AdminPerformanceSeatQueryRow> rows =
                    adminPerformanceSeatQueryMapper
                            .findAll(
                                    condition
                            );

            seats =
                    rows.stream()
                            .map(
                                    AdminPerformanceSeatResult::from
                            )
                            .toList();
        }

        return AdminPerformanceSeatPageResult.of(
                seats,
                page,
                size,
                totalElements
        );
    }

    private void validatePerformanceExists(
            Long performanceId
    ) {
        if (performanceId == null
                || performanceId <= 0) {

            throw new PerformanceException(
                    PerformanceErrorCode
                            .PERFORMANCE_NOT_FOUND
            );
        }

        performanceRepository
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
