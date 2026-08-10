package com.concert.backend.performance.presentation;

import com.concert.backend.performance.application.CreatePerformanceService;
import com.concert.backend.performance.application.GetAdminPerformancesService;
import com.concert.backend.performance.application.UpdatePerformanceService;
import com.concert.backend.performance.application.UpdatePerformanceStatusService;
import com.concert.backend.performance.application.result.AdminPerformancePageResult;
import com.concert.backend.performance.application.result.PerformanceResult;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.presentation.request.CreatePerformanceRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceStatusRequest;
import com.concert.backend.performance.presentation.response.GetAdminPerformancesResponse;
import com.concert.backend.performance.presentation.response.PerformanceResponse;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
public class AdminPerformanceController
        implements AdminPerformanceControllerDocs {

    private final CreatePerformanceService createPerformanceService;
    private final UpdatePerformanceService updatePerformanceService;
    private final UpdatePerformanceStatusService
            updatePerformanceStatusService;
    private final GetAdminPerformancesService
            getAdminPerformancesService;

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
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(
            "/api/v1/admin/concerts/{concertId}/performances"
    )
    public ResponseEntity<GetAdminPerformancesResponse>
    getPerformances(
            @PathVariable
            Long concertId,

            @RequestParam(required = false)
            PerformanceStatus status,

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

            @Parameter(
                    description = "페이지 번호 (0부터 시작)",
                    example = "0"
            )
            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @Parameter(
                    description = "페이지 크기",
                    example = "20"
            )
            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        AdminPerformancePageResult result =
                getAdminPerformancesService
                        .getPerformances(
                                concertId,
                                status,
                                from,
                                to,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                GetAdminPerformancesResponse.from(
                        result
                )
        );
    }
}
