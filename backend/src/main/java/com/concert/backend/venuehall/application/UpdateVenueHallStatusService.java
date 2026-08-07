package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.command.UpdateVenueHallStatusCommand;
import com.concert.backend.venuehall.application.result.VenueHallResult;
import com.concert.backend.venuehall.domain.VenueHall;
import com.concert.backend.venuehall.domain.VenueHallRepository;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdateVenueHallStatusService {

    private final VenueHallRepository venueHallRepository;

    @Transactional
    public VenueHallResult updateStatus(
            Long venueHallId,
            UpdateVenueHallStatusCommand command
    ) {
        VenueHall venueHall =
                venueHallRepository.findById(venueHallId)
                        .orElseThrow(() ->
                                new VenueHallException(
                                        VenueHallErrorCode.VENUE_HALL_NOT_FOUND
                                )
                        );

        venueHall.changeStatus(command.status());

        return VenueHallResult.from(venueHall);
    }
}
