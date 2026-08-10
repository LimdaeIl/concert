package com.concert.backend.venuehall.presentation;

import com.concert.backend.venuehall.application.CreateVenueHallService;
import com.concert.backend.venuehall.application.GetAdminVenueHallsService;
import com.concert.backend.venuehall.application.UpdateVenueHallService;
import com.concert.backend.venuehall.application.UpdateVenueHallStatusService;
import com.concert.backend.venuehall.application.result.AdminVenueHallPageResult;
import com.concert.backend.venuehall.application.result.VenueHallResult;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import com.concert.backend.venuehall.presentation.request.CreateVenueHallRequest;
import com.concert.backend.venuehall.presentation.request.UpdateVenueHallRequest;
import com.concert.backend.venuehall.presentation.request.UpdateVenueHallStatusRequest;
import com.concert.backend.venuehall.presentation.response.GetAdminVenueHallsResponse;
import com.concert.backend.venuehall.presentation.response.VenueHallResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class AdminVenueHallController implements AdminVenueHallControllerDocs {

    private final CreateVenueHallService createVenueHallService;
    private final UpdateVenueHallService updateVenueHallService;
    private final UpdateVenueHallStatusService updateVenueHallStatusService;
    private final GetAdminVenueHallsService getAdminVenueHallsService;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            "/api/v1/admin/venues/{venueId}/halls"
    )
    public ResponseEntity<VenueHallResponse> create(
            @PathVariable Long venueId,
            @Valid @RequestBody CreateVenueHallRequest request
    ) {
        VenueHallResult result =
                createVenueHallService.create(
                        venueId,
                        request.toCommand()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(VenueHallResponse.from(result));
    }
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/api/v1/admin/halls/{venueHallId}"
    )
    public ResponseEntity<VenueHallResponse> update(
            @PathVariable Long venueHallId,
            @Valid @RequestBody UpdateVenueHallRequest request
    ) {
        VenueHallResult result =
                updateVenueHallService.update(
                        venueHallId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                VenueHallResponse.from(result)
        );
    }
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/api/v1/admin/halls/{venueHallId}/status"
    )
    public ResponseEntity<VenueHallResponse> updateStatus(
            @PathVariable Long venueHallId,
            @Valid
            @RequestBody
            UpdateVenueHallStatusRequest request
    ) {
        VenueHallResult result =
                updateVenueHallStatusService.updateStatus(
                        venueHallId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                VenueHallResponse.from(result)
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin/venues/{venueId}/halls")
    public ResponseEntity<GetAdminVenueHallsResponse>
    getVenueHalls(
            @PathVariable
            Long venueId,

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            VenueHallStatus status,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        AdminVenueHallPageResult result =
                getAdminVenueHallsService
                        .getVenueHalls(
                                venueId,
                                keyword,
                                status,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                GetAdminVenueHallsResponse.from(
                        result
                )
        );
    }
}
