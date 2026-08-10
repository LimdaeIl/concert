package com.concert.backend.venuehall.presentation;

import com.concert.backend.venuehall.application.BulkCreateSeatService;
import com.concert.backend.venuehall.application.GetAdminSeatsService;
import com.concert.backend.venuehall.application.UpdateSeatService;
import com.concert.backend.venuehall.application.UpdateSeatStatusService;
import com.concert.backend.venuehall.application.result.AdminSeatPageResult;
import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import com.concert.backend.venuehall.presentation.request.BulkCreateSeatRequest;
import com.concert.backend.venuehall.presentation.request.UpdateSeatRequest;
import com.concert.backend.venuehall.presentation.request.UpdateSeatStatusRequest;
import com.concert.backend.venuehall.presentation.response.GetAdminSeatsResponse;
import com.concert.backend.venuehall.presentation.response.GetSeatsResponse;
import com.concert.backend.venuehall.presentation.response.SeatResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
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
public class AdminSeatController implements AdminSeatControllerDocs {

    private final BulkCreateSeatService bulkCreateSeatService;
    private final UpdateSeatService updateSeatService;
    private final UpdateSeatStatusService updateSeatStatusService;
    private final GetAdminSeatsService getAdminSeatsService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            "/api/v1/admin/halls/{venueHallId}/seats/bulk"
    )
    public ResponseEntity<GetSeatsResponse> bulkCreate(
            @PathVariable Long venueHallId,
            @Valid @RequestBody BulkCreateSeatRequest request
    ) {
        List<SeatResult> results =
                bulkCreateSeatService.create(
                        venueHallId,
                        request.toCommands()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(GetSeatsResponse.from(results));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/api/v1/admin/seats/{seatId}")
    public ResponseEntity<SeatResponse> update(
            @PathVariable Long seatId,
            @Valid @RequestBody UpdateSeatRequest request
    ) {
        SeatResult result =
                updateSeatService.update(
                        seatId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                SeatResponse.from(result)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/api/v1/admin/seats/{seatId}/status"
    )
    public ResponseEntity<SeatResponse> updateStatus(
            @PathVariable Long seatId,
            @Valid
            @RequestBody
            UpdateSeatStatusRequest request
    ) {
        SeatResult result =
                updateSeatStatusService.updateStatus(
                        seatId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                SeatResponse.from(result)
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(
            "/api/v1/admin/halls/{venueHallId}/seats"
    )
    public ResponseEntity<GetAdminSeatsResponse>
    getSeats(
            @PathVariable
            Long venueHallId,

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Short floor,

            @RequestParam(required = false)
            SeatType seatType,

            @RequestParam(required = false)
            SeatStatus status,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        AdminSeatPageResult result =
                getAdminSeatsService.getSeats(
                        venueHallId,
                        keyword,
                        floor,
                        seatType,
                        status,
                        page,
                        size
                );

        return ResponseEntity.ok(
                GetAdminSeatsResponse.from(
                        result
                )
        );
    }
}
