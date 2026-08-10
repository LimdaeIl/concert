package com.concert.backend.venuehall.application;

import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import com.concert.backend.venuehall.application.result.AdminVenueHallPageResult;
import com.concert.backend.venuehall.application.result.AdminVenueHallResult;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import com.concert.backend.venuehall.query.AdminVenueHallQueryMapper;
import com.concert.backend.venuehall.query.AdminVenueHallSearchCondition;
import com.concert.backend.venuehall.query.AdminVenueHallQueryRow;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminVenueHallsService {

    private final VenueRepository venueRepository;
    private final AdminVenueHallQueryMapper adminVenueHallQueryMapper;

    @Transactional(readOnly = true)
    public AdminVenueHallPageResult getVenueHalls(
            Long venueId,
            String keyword,
            VenueHallStatus status,
            int page,
            int size
    ) {
        validateVenueExists(venueId);

        String normalizedKeyword =
                normalizeKeyword(keyword);

        long offset =
                (long) page * size;

        AdminVenueHallSearchCondition condition =
                new AdminVenueHallSearchCondition(
                        venueId,
                        normalizedKeyword,
                        status,
                        size,
                        offset
                );

        long totalElements =
                adminVenueHallQueryMapper.count(condition);

        List<AdminVenueHallResult> halls;

        if (totalElements == 0
                || offset >= totalElements) {

            halls = List.of();

        } else {
            List<AdminVenueHallQueryRow> rows =
                    adminVenueHallQueryMapper.findAll(
                            condition
                    );

            halls =
                    rows.stream()
                            .map(
                                    AdminVenueHallResult::from
                            )
                            .toList();
        }

        return AdminVenueHallPageResult.of(
                halls,
                page,
                size,
                totalElements
        );
    }

    private void validateVenueExists(
            Long venueId
    ) {
        if (venueId == null || venueId <= 0) {
            throw new VenueException(
                    VenueErrorCode.VENUE_NOT_FOUND
            );
        }

        venueRepository.findById(venueId)
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
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

        if (normalized.isEmpty()) {
            return null;
        }

        return normalized;
    }
}
