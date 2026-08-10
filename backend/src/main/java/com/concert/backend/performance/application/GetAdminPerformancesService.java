package com.concert.backend.performance.application;

import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import com.concert.backend.performance.application.result.AdminPerformancePageResult;
import com.concert.backend.performance.application.result.AdminPerformanceResult;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.query.AdminPerformanceQueryMapper;
import com.concert.backend.performance.query.AdminPerformanceQueryRow;
import com.concert.backend.performance.query.AdminPerformanceSearchCondition;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminPerformancesService {

    private final ConcertRepository concertRepository;

    private final AdminPerformanceQueryMapper
            adminPerformanceQueryMapper;

    @Transactional(readOnly = true)
    public AdminPerformancePageResult getPerformances(
            Long concertId,
            PerformanceStatus status,
            LocalDateTime from,
            LocalDateTime to,
            int page,
            int size
    ) {
        validateConcertExists(
                concertId
        );

        validatePeriod(
                from,
                to
        );

        long offset =
                (long) page * size;

        AdminPerformanceSearchCondition condition =
                new AdminPerformanceSearchCondition(
                        concertId,
                        status,
                        from,
                        to,
                        size,
                        offset
                );

        long totalElements =
                adminPerformanceQueryMapper
                        .count(
                                condition
                        );

        List<AdminPerformanceResult> performances;

        if (totalElements == 0
                || offset >= totalElements) {

            performances =
                    List.of();

        } else {
            List<AdminPerformanceQueryRow> rows =
                    adminPerformanceQueryMapper
                            .findAll(
                                    condition
                            );

            performances =
                    rows.stream()
                            .map(
                                    AdminPerformanceResult::from
                            )
                            .toList();
        }

        return AdminPerformancePageResult.of(
                performances,
                page,
                size,
                totalElements
        );
    }

    private void validateConcertExists(
            Long concertId
    ) {
        if (concertId == null
                || concertId <= 0) {

            throw new ConcertException(
                    ConcertErrorCode.CONCERT_NOT_FOUND
            );
        }

        concertRepository
                .findById(
                        concertId
                )
                .orElseThrow(() ->
                        new ConcertException(
                                ConcertErrorCode.CONCERT_NOT_FOUND
                        )
                );
    }

    private void validatePeriod(
            LocalDateTime from,
            LocalDateTime to
    ) {
        if (from == null
                || to == null) {
            return;
        }

        if (to.isBefore(from)) {
            throw new IllegalArgumentException(
                    "조회 종료일시는 시작일시보다 빠를 수 없습니다."
            );
        }
    }
}
