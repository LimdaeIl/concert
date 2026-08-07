package com.concert.backend.concert.presentation;

import com.concert.backend.concert.application.CreateConcertService;
import com.concert.backend.concert.application.UpdateConcertService;
import com.concert.backend.concert.application.UpdateConcertStatusService;
import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.presentation.request.CreateConcertRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertStatusRequest;
import com.concert.backend.concert.presentation.response.ConcertResponse;
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
@RequestMapping("/api/v1/admin/concerts")
@RestController
public class AdminConcertController implements AdminConcertControllerDocs {

    private final CreateConcertService createConcertService;
    private final UpdateConcertService updateConcertService;
    private final UpdateConcertStatusService updateConcertStatusService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ConcertResponse> create(
            @Valid @RequestBody CreateConcertRequest request
    ) {
        ConcertResult result =
                createConcertService.create(
                        request.toCommand()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ConcertResponse.from(result));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{concertId}")
    public ResponseEntity<ConcertResponse> update(
            @PathVariable Long concertId,
            @Valid @RequestBody UpdateConcertRequest request
    ) {
        ConcertResult result =
                updateConcertService.update(
                        concertId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                ConcertResponse.from(result)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{concertId}/status")
    public ResponseEntity<ConcertResponse> updateStatus(
            @PathVariable Long concertId,
            @Valid
            @RequestBody
            UpdateConcertStatusRequest request
    ) {
        ConcertResult result =
                updateConcertStatusService.updateStatus(
                        concertId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                ConcertResponse.from(result)
        );
    }
}
