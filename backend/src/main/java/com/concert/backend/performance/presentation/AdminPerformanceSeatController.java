package com.concert.backend.performance.presentation;

import com.concert.backend.performance.application.BulkCreatePerformanceSeatService;
import com.concert.backend.performance.application.UpdatePerformanceSeatService;
import com.concert.backend.performance.application.UpdatePerformanceSeatStatusService;
import com.concert.backend.performance.application.result.PerformanceSeatResult;
import com.concert.backend.performance.presentation.request.BulkCreatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatStatusRequest;
import com.concert.backend.performance.presentation.response.GetPerformanceSeatsResponse;
import com.concert.backend.performance.presentation.response.PerformanceSeatResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
}
