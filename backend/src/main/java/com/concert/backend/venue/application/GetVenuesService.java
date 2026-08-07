package com.concert.backend.venue.application;

import com.concert.backend.venue.application.result.VenueResult;
import com.concert.backend.venue.domain.VenueRepository;
import com.concert.backend.venue.domain.VenueStatus;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetVenuesService {

    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public List<VenueResult> getVenues() {
        return venueRepository
                .findAllByStatus(VenueStatus.ACTIVE)
                .stream()
                .map(VenueResult::from)
                .toList();
    }
}
