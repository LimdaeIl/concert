package com.concert.backend.performance.presentation;

import com.concert.backend.performance.application.BulkCreatePerformanceSeatService;
import com.concert.backend.performance.application.GetAdminPerformanceSeatCandidatesService;
import com.concert.backend.performance.application.GetAdminPerformanceSeatsService;
import com.concert.backend.performance.application.UpdatePerformanceSeatService;
import com.concert.backend.performance.application.UpdatePerformanceSeatStatusService;
import com.concert.backend.performance.application.result.AdminPerformanceSeatCandidatePageResult;
import com.concert.backend.performance.application.result.AdminPerformanceSeatPageResult;
import com.concert.backend.performance.application.result.PerformanceSeatResult;
import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.performance.presentation.request.BulkCreatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatStatusRequest;
import com.concert.backend.performance.presentation.response.GetAdminPerformanceSeatCandidatesResponse;
import com.concert.backend.performance.presentation.response.GetAdminPerformanceSeatsResponse;
import com.concert.backend.performance.presentation.response.GetPerformanceSeatsResponse;
import com.concert.backend.performance.presentation.response.PerformanceSeatResponse;
import com.concert.backend.venuehall.domain.SeatType;
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
public class AdminPerformanceSeatController
        implements AdminPerformanceSeatControllerDocs {

    private final BulkCreatePerformanceSeatService
            bulkCreatePerformanceSeatService;

    private final UpdatePerformanceSeatService
            updatePerformanceSeatService;

    private final UpdatePerformanceSeatStatusService
            updatePerformanceSeatStatusService;

    private final GetAdminPerformanceSeatsService
            getAdminPerformanceSeatsService;

    private final GetAdminPerformanceSeatCandidatesService
            getAdminPerformanceSeatCandidatesService;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            "/api/v1/admin/performances/{performanceId}/seats/bulk"
    )
    public ResponseEntity<GetPerformanceSeatsResponse>
    bulkCreate(
            @PathVariable Long performanceId,
            @Valid @RequestBody
            BulkCreatePerformanceSeatRequest request
    ) {
        List<PerformanceSeatResult> results =
                bulkCreatePerformanceSeatService.create(
                        performanceId,
                        request.toCommands()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        GetPerformanceSeatsResponse.from(results)
                );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/api/v1/admin/performance-seats/{performanceSeatId}"
    )
    public ResponseEntity<PerformanceSeatResponse> update(
            @PathVariable Long performanceSeatId,
            @Valid @RequestBody
            UpdatePerformanceSeatRequest request
    ) {
        PerformanceSeatResult result =
                updatePerformanceSeatService.update(
                        performanceSeatId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                PerformanceSeatResponse.from(result)
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/api/v1/admin/performance-seats/{performanceSeatId}/status"
    )
    public ResponseEntity<PerformanceSeatResponse> updateStatus(
            @PathVariable Long performanceSeatId,
            @Valid @RequestBody
            UpdatePerformanceSeatStatusRequest request
    ) {
        PerformanceSeatResult result =
                updatePerformanceSeatStatusService
                        .updateStatus(
                                performanceSeatId,
                                request.toCommand()
                        );

        return ResponseEntity.ok(
                PerformanceSeatResponse.from(result)
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(
            "/api/v1/admin/performances/{performanceId}/seats"
    )
    public ResponseEntity<GetAdminPerformanceSeatsResponse>
    getSeats(
            @PathVariable
            Long performanceId,

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Short floor,

            @RequestParam(required = false)
            SeatGrade grade,

            @RequestParam(required = false)
            SeatType seatType,

            @RequestParam(required = false)
            PerformanceSeatStatus status,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        AdminPerformanceSeatPageResult result =
                getAdminPerformanceSeatsService
                        .getSeats(
                                performanceId,
                                keyword,
                                floor,
                                grade,
                                seatType,
                                status,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                GetAdminPerformanceSeatsResponse.from(
                        result
                )
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(
            "/api/v1/admin/performances/{performanceId}/candidate-seats"
    )
    public ResponseEntity<GetAdminPerformanceSeatCandidatesResponse>
    getCandidateSeats(
            @PathVariable
            Long performanceId,

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Short floor,

            @RequestParam(required = false)
            SeatType seatType,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "50")
            @Min(1)
            @Max(100)
            int size
    ) {
        AdminPerformanceSeatCandidatePageResult result =
                getAdminPerformanceSeatCandidatesService
                        .getCandidates(
                                performanceId,
                                keyword,
                                floor,
                                seatType,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                GetAdminPerformanceSeatCandidatesResponse.from(
                        result
                )
        );
    }
}
