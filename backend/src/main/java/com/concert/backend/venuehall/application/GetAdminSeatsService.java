package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.result.AdminSeatPageResult;
import com.concert.backend.venuehall.application.result.AdminSeatResult;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import com.concert.backend.venuehall.query.AdminSeatQueryMapper;
import com.concert.backend.venuehall.query.AdminSeatQueryRow;
import com.concert.backend.venuehall.query.AdminSeatSearchCondition;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminSeatsService {

    private final VenueHallRepository venueHallRepository;
    private final AdminSeatQueryMapper adminSeatQueryMapper;

    @Transactional(readOnly = true)
    public AdminSeatPageResult getSeats(
            Long venueHallId,
            String keyword,
            Short floor,
            SeatType seatType,
            SeatStatus status,
            int page,
            int size
    ) {
        validateVenueHallExists(
                venueHallId
        );

        String normalizedKeyword =
                normalizeKeyword(
                        keyword
                );

        long offset =
                (long) page * size;

        AdminSeatSearchCondition condition =
                new AdminSeatSearchCondition(
                        venueHallId,
                        normalizedKeyword,
                        floor,
                        seatType,
                        status,
                        size,
                        offset
                );

        long totalElements =
                adminSeatQueryMapper.count(
                        condition
                );

        List<AdminSeatResult> seats;

        if (totalElements == 0
                || offset >= totalElements) {

            seats = List.of();

        } else {
            List<AdminSeatQueryRow> rows =
                    adminSeatQueryMapper.findAll(
                            condition
                    );

            seats =
                    rows.stream()
                            .map(
                                    AdminSeatResult::from
                            )
                            .toList();
        }

        return AdminSeatPageResult.of(
                seats,
                page,
                size,
                totalElements
        );
    }

    private void validateVenueHallExists(
            Long venueHallId
    ) {
        if (venueHallId == null
                || venueHallId <= 0) {

            throw new VenueHallException(
                    VenueHallErrorCode
                            .VENUE_HALL_NOT_FOUND
            );
        }

        venueHallRepository
                .findById(
                        venueHallId
                )
                .orElseThrow(() ->
                        new VenueHallException(
                                VenueHallErrorCode
                                        .VENUE_HALL_NOT_FOUND
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
