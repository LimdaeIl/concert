package com.concert.backend.reservation.application;

import com.concert.backend.reservation.application.result.AdminReservationPageResult;
import com.concert.backend.reservation.application.result.AdminReservationResult;
import com.concert.backend.reservation.domain.ReservationStatus;
import com.concert.backend.reservation.query.AdminReservationQueryMapper;
import com.concert.backend.reservation.query.AdminReservationQueryRow;
import com.concert.backend.reservation.query.AdminReservationSearchCondition;
import com.concert.backend.reservation.query.AdminReservationSortType;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminReservationsService {

    private final AdminReservationQueryMapper
            adminReservationQueryMapper;

    @Transactional(readOnly = true)
    public AdminReservationPageResult getReservations(
            String keyword,
            ReservationStatus status,
            Long performanceId,
            LocalDateTime from,
            LocalDateTime to,
            AdminReservationSortType sort,
            int page,
            int size
    ) {
        validatePeriod(
                from,
                to
        );

        String normalizedKeyword =
                normalizeKeyword(
                        keyword
                );

        AdminReservationSortType normalizedSort =
                sort == null
                        ? AdminReservationSortType
                        .RESERVED_AT_DESC
                        : sort;

        long offset =
                (long) page * size;

        AdminReservationSearchCondition condition =
                new AdminReservationSearchCondition(
                        normalizedKeyword,
                        status,
                        performanceId,
                        from,
                        to,
                        normalizedSort,
                        size,
                        offset
                );

        long totalElements =
                adminReservationQueryMapper
                        .count(
                                condition
                        );

        List<AdminReservationResult> reservations;

        if (totalElements == 0
                || offset >= totalElements) {

            reservations =
                    List.of();

        } else {
            List<AdminReservationQueryRow> rows =
                    adminReservationQueryMapper
                            .findAll(
                                    condition
                            );

            reservations =
                    rows.stream()
                            .map(
                                    AdminReservationResult::from
                            )
                            .toList();
        }

        return AdminReservationPageResult.of(
                reservations,
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
