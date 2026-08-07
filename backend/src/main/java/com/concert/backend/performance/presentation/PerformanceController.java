package com.concert.backend.performance.presentation;

import com.concert.backend.performance.application.GetPerformanceService;
import com.concert.backend.performance.application.GetPerformancesService;
import com.concert.backend.performance.application.result.PerformanceResult;
import com.concert.backend.performance.presentation.response.GetPerformancesResponse;
import com.concert.backend.performance.presentation.response.PerformanceResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class PerformanceController
        implements PerformanceControllerDocs {

    private final GetPerformancesService getPerformancesService;
    private final GetPerformanceService getPerformanceService;

    @Override
    @GetMapping(
            "/api/v1/concerts/{concertId}/performances"
    )
    public ResponseEntity<GetPerformancesResponse> getPerformances(
            @PathVariable Long concertId
    ) {
        List<PerformanceResult> results =
                getPerformancesService.getPerformances(
                        concertId
                );

        return ResponseEntity.ok(
                GetPerformancesResponse.from(results)
        );
    }

    @Override
    @GetMapping(
            "/api/v1/performances/{performanceId}"
    )
    public ResponseEntity<PerformanceResponse> getPerformance(
            @PathVariable Long performanceId
    ) {
        PerformanceResult result =
                getPerformanceService.getPerformance(
                        performanceId
                );

        return ResponseEntity.ok(
                PerformanceResponse.from(result)
        );
    }
}
