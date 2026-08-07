package com.concert.backend.venue.presentation;

import com.concert.backend.venue.application.GetVenueService;
import com.concert.backend.venue.application.GetVenuesService;
import com.concert.backend.venue.application.result.VenueResult;
import com.concert.backend.venue.presentation.response.GetVenuesResponse;
import com.concert.backend.venue.presentation.response.VenueResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/venues")
@RestController
public class VenueController {

    private final GetVenuesService getVenuesService;
    private final GetVenueService getVenueService;

    @GetMapping
    public ResponseEntity<GetVenuesResponse> getVenues() {
        List<VenueResult> results =
                getVenuesService.getVenues();

        return ResponseEntity.ok(
                GetVenuesResponse.from(results)
        );
    }

    @GetMapping("/{venueId}")
    public ResponseEntity<VenueResponse> getVenue(
            @PathVariable Long venueId
    ) {
        VenueResult result =
                getVenueService.getVenue(venueId);

        return ResponseEntity.ok(
                VenueResponse.from(result)
        );
    }
}
