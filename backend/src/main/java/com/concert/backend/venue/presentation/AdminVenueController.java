package com.concert.backend.venue.presentation;

import com.concert.backend.venue.application.CreateVenueService;
import com.concert.backend.venue.application.UpdateVenueService;
import com.concert.backend.venue.application.UpdateVenueStatusService;
import com.concert.backend.venue.application.result.CreateVenueResult;
import com.concert.backend.venue.application.result.VenueResult;
import com.concert.backend.venue.presentation.request.CreateVenueRequest;
import com.concert.backend.venue.presentation.request.UpdateVenueRequest;
import com.concert.backend.venue.presentation.request.UpdateVenueStatusRequest;
import com.concert.backend.venue.presentation.response.CreateVenueResponse;
import com.concert.backend.venue.presentation.response.VenueResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/venues")
@RestController
public class AdminVenueController implements AdminVenueControllerDocs {

    private final CreateVenueService createVenueService;
    private final UpdateVenueService updateVenueService;
    private final UpdateVenueStatusService updateVenueStatusService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CreateVenueResponse> create(
            @Valid @RequestBody CreateVenueRequest request
    ) {
        CreateVenueResult result = createVenueService.create(request.toCommand());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(CreateVenueResponse.from(result));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{venueId}")
    public ResponseEntity<VenueResponse> update(
            @PathVariable Long venueId,
            @Valid @RequestBody UpdateVenueRequest request
    ) {
        VenueResult result =
                updateVenueService.update(
                        venueId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                VenueResponse.from(result)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{venueId}/status")
    public ResponseEntity<VenueResponse> updateStatus(
            @PathVariable Long venueId,
            @Valid @RequestBody UpdateVenueStatusRequest request
    ) {
        VenueResult result =
                updateVenueStatusService.updateStatus(
                        venueId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                VenueResponse.from(result)
        );
    }
}