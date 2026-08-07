package com.concert.backend.venuehall.presentation;

import com.concert.backend.venuehall.application.GetVenueHallService;
import com.concert.backend.venuehall.application.GetVenueHallsService;
import com.concert.backend.venuehall.application.result.VenueHallResult;
import com.concert.backend.venuehall.presentation.response.GetVenueHallsResponse;
import com.concert.backend.venuehall.presentation.response.VenueHallResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class VenueHallController implements VenueHallControllerDocs {

    private final GetVenueHallsService getVenueHallsService;
    private final GetVenueHallService getVenueHallService;

    @GetMapping("/api/v1/venues/{venueId}/halls")
    public ResponseEntity<GetVenueHallsResponse> getVenueHalls(
            @PathVariable Long venueId
    ) {
        List<VenueHallResult> results =
                getVenueHallsService.getVenueHalls(venueId);

        return ResponseEntity.ok(
                GetVenueHallsResponse.from(results)
        );
    }

    @GetMapping("/api/v1/halls/{venueHallId}")
    public ResponseEntity<VenueHallResponse> getVenueHall(
            @PathVariable Long venueHallId
    ) {
        VenueHallResult result =
                getVenueHallService.getVenueHall(
                        venueHallId
                );

        return ResponseEntity.ok(
                VenueHallResponse.from(result)
        );
    }
}
