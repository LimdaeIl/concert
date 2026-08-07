package com.concert.backend.performance.presentation;

import com.concert.backend.performance.application.CreatePerformanceService;
import com.concert.backend.performance.application.UpdatePerformanceService;
import com.concert.backend.performance.application.UpdatePerformanceStatusService;
import com.concert.backend.performance.application.result.PerformanceResult;
import com.concert.backend.performance.presentation.request.CreatePerformanceRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceStatusRequest;
import com.concert.backend.performance.presentation.response.PerformanceResponse;
import jakarta.validation.Valid;
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
public class AdminPerformanceController
        implements AdminPerformanceControllerDocs {

    private final CreatePerformanceService createPerformanceService;
    private final UpdatePerformanceService updatePerformanceService;
    private final UpdatePerformanceStatusService
            updatePerformanceStatusService;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            "/api/v1/admin/concerts/{concertId}/performances"
    )
    public ResponseEntity<PerformanceResponse> create(
            @PathVariable Long concertId,
            @Valid @RequestBody
            CreatePerformanceRequest request
    ) {
        PerformanceResult result =
                createPerformanceService.create(
                        concertId,
                        request.toCommand()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(PerformanceResponse.from(result));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/api/v1/admin/performances/{performanceId}"
    )
    public ResponseEntity<PerformanceResponse> update(
            @PathVariable Long performanceId,
            @Valid @RequestBody
            UpdatePerformanceRequest request
    ) {
        PerformanceResult result =
                updatePerformanceService.update(
                        performanceId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                PerformanceResponse.from(result)
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/api/v1/admin/performances/{performanceId}/status"
    )
    public ResponseEntity<PerformanceResponse> updateStatus(
            @PathVariable Long performanceId,
            @Valid @RequestBody
            UpdatePerformanceStatusRequest request
    ) {
        PerformanceResult result =
                updatePerformanceStatusService.updateStatus(
                        performanceId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                PerformanceResponse.from(result)
        );
    }
}
