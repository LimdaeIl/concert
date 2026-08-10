package com.concert.backend.reservation.presentation;

import com.concert.backend.reservation.application.GetAdminReservationsService;
import com.concert.backend.reservation.application.result.AdminReservationPageResult;
import com.concert.backend.reservation.domain.ReservationStatus;
import com.concert.backend.reservation.presentation.response.GetAdminReservationsResponse;
import com.concert.backend.reservation.query.AdminReservationSortType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/reservations")
@RestController
public class AdminReservationController
        implements AdminReservationControllerDocs {

    private final GetAdminReservationsService
            getAdminReservationsService;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<GetAdminReservationsResponse>
    getReservations(
            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            ReservationStatus status,

            @RequestParam(required = false)
            Long performanceId,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime from,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime to,

            @RequestParam(
                    defaultValue = "RESERVED_AT_DESC"
            )
            AdminReservationSortType sort,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        AdminReservationPageResult result =
                getAdminReservationsService
                        .getReservations(
                                keyword,
                                status,
                                performanceId,
                                from,
                                to,
                                sort,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                GetAdminReservationsResponse.from(
                        result
                )
        );
    }
}
