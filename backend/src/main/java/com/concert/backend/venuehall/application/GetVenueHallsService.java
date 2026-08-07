package com.concert.backend.venuehall.application;

import com.concert.backend.venue.domain.Venue;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.domain.VenueStatus;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import com.concert.backend.venuehall.application.result.VenueHallResult;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetVenueHallsService {

    private final VenueRepository venueRepository;
    private final VenueHallRepository venueHallRepository;

    @Transactional(readOnly = true)
    public List<VenueHallResult> getVenueHalls(
            Long venueId
    ) {
        venueRepository.findByIdAndStatus(
                        venueId,
                        VenueStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new VenueException(
                                VenueErrorCode.VENUE_NOT_FOUND
                        )
                );

        return venueHallRepository
                .findAllByVenueIdAndStatus(
                        venueId,
                        VenueHallStatus.ACTIVE
                )
                .stream()
                .map(VenueHallResult::from)
                .toList();
    }
}
