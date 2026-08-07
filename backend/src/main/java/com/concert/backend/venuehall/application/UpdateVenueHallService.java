package com.concert.backend.venuehall.application;

import com.concert.backend.venuehall.application.command.UpdateVenueHallCommand;
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
public class UpdateVenueHallService {

    private final VenueHallRepository venueHallRepository;

    @Transactional
    public VenueHallResult update(
            Long venueHallId,
            UpdateVenueHallCommand command
    ) {
        VenueHall venueHall =
                findVenueHall(venueHallId);

        validateDuplicateName(
                venueHall,
                command.name()
        );

        venueHall.update(
                command.name(),
                command.floor(),
                command.capacity()
        );

        return VenueHallResult.from(venueHall);
    }

    private VenueHall findVenueHall(
            Long venueHallId
    ) {
        return venueHallRepository.findById(venueHallId)
                .orElseThrow(() ->
                        new VenueHallException(
                                VenueHallErrorCode.VENUE_HALL_NOT_FOUND
                        )
                );
    }

    private void validateDuplicateName(
            VenueHall venueHall,
            String name
    ) {
        if (venueHallRepository
                .existsByVenueIdAndNameAndIdNot(
                        venueHall.getVenueId(),
                        name,
                        venueHall.getId()
                )) {
            throw new VenueHallException(
                    VenueHallErrorCode.DUPLICATE_VENUE_HALL
            );
        }
    }
}
