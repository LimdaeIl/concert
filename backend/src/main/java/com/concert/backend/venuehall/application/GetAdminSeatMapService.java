package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.SeatRepository;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminSeatMapService {

    private final VenueHallRepository venueHallRepository;
    private final SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public List<SeatResult> getSeatMap(
            Long venueHallId,
            String keyword,
            Short floor,
            SeatType seatType,
            SeatStatus status
    ) {
        validateVenueHallExists(
                venueHallId
        );

        String normalizedKeyword =
                normalizeKeyword(
                        keyword
                );

        return seatRepository
                .findAllForAdminSeatMap(
                        venueHallId,
                        normalizedKeyword,
                        floor,
                        seatType,
                        status
                )
                .stream()
                .map(SeatResult::from)
                .toList();
    }

    private void validateVenueHallExists(
            Long venueHallId
    ) {
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
        if (
                keyword == null
                        || keyword.isBlank()
        ) {
            return null;
        }

        return keyword.trim();
    }
}
