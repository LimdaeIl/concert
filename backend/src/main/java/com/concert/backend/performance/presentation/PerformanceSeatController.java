package com.concert.backend.performance.presentation;

import com.concert.backend.performance.application.GetPerformanceSeatsService;
import com.concert.backend.performance.application.result.PerformanceSeatResult;
import com.concert.backend.venuehall.presentation.response.GetPerformanceSeatsResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class PerformanceSeatController
        implements PerformanceSeatControllerDocs {

    private final GetPerformanceSeatsService
            getPerformanceSeatsService;

    @Override
    @GetMapping(
            "/api/v1/performances/{performanceId}/seats"
    )
    public ResponseEntity<GetPerformanceSeatsResponse>
    getSeats(
            @PathVariable Long performanceId
    ) {
        List<PerformanceSeatResult> results =
                getPerformanceSeatsService.getSeats(
                        performanceId
                );

        return ResponseEntity.ok(
                GetPerformanceSeatsResponse.from(results)
        );
    }
}
