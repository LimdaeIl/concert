package com.concert.backend.concert.presentation;

import com.concert.backend.common.storage.result.PresignedUploadResult;
import com.concert.backend.concert.application.CreateConcertPosterUploadUrlService;
import com.concert.backend.concert.application.CreateConcertService;
import com.concert.backend.concert.application.DeleteConcertPosterService;
import com.concert.backend.concert.application.GetAdminConcertsService;
import com.concert.backend.concert.application.UpdateConcertPosterService;
import com.concert.backend.concert.application.UpdateConcertService;
import com.concert.backend.concert.application.UpdateConcertStatusService;
import com.concert.backend.concert.application.result.AdminConcertPageResult;
import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.presentation.request.CreateConcertPosterUploadUrlRequest;
import com.concert.backend.concert.presentation.request.CreateConcertRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertPosterRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertStatusRequest;
import com.concert.backend.concert.presentation.response.ConcertPosterUploadUrlResponse;
import com.concert.backend.concert.presentation.response.ConcertResponse;
import com.concert.backend.concert.presentation.response.GetAdminConcertsResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping(
        "/api/v1/admin/concerts"
)
@RestController
public class AdminConcertController
        implements AdminConcertControllerDocs {

    private final CreateConcertService
            createConcertService;

    private final UpdateConcertService
            updateConcertService;

    private final UpdateConcertStatusService
            updateConcertStatusService;

    private final GetAdminConcertsService
            getAdminConcertsService;

    private final CreateConcertPosterUploadUrlService
            createConcertPosterUploadUrlService;

    private final UpdateConcertPosterService
            updateConcertPosterService;

    private final DeleteConcertPosterService
            deleteConcertPosterService;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ConcertResponse> create(
            @Valid
            @RequestBody
            CreateConcertRequest request
    ) {
        ConcertResult result =
                createConcertService.create(
                        request.toCommand()
                );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        ConcertResponse.from(
                                result
                        )
                );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{concertId}")
    public ResponseEntity<ConcertResponse> update(
            @PathVariable
            Long concertId,

            @Valid
            @RequestBody
            UpdateConcertRequest request
    ) {
        ConcertResult result =
                updateConcertService.update(
                        concertId,
                        request.toCommand()
                );

        return ResponseEntity.ok(
                ConcertResponse.from(
                        result
                )
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/{concertId}/status"
    )
    public ResponseEntity<ConcertResponse> updateStatus(
            @PathVariable
            Long concertId,

            @Valid
            @RequestBody
            UpdateConcertStatusRequest request
    ) {
        ConcertResult result =
                updateConcertStatusService
                        .updateStatus(
                                concertId,
                                request.toCommand()
                        );

        return ResponseEntity.ok(
                ConcertResponse.from(
                        result
                )
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<GetAdminConcertsResponse>
    getConcerts(
            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            ConcertCategory category,

            @RequestParam(required = false)
            ConcertStatus status,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        AdminConcertPageResult result =
                getAdminConcertsService
                        .getConcerts(
                                keyword,
                                category,
                                status,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                GetAdminConcertsResponse.from(
                        result
                )
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            "/{concertId}/poster/upload-url"
    )
    public ResponseEntity<ConcertPosterUploadUrlResponse>
    createPosterUploadUrl(
            @PathVariable
            Long concertId,

            @Valid
            @RequestBody
            CreateConcertPosterUploadUrlRequest request
    ) {
        PresignedUploadResult result =
                createConcertPosterUploadUrlService
                        .create(
                                concertId,
                                request.contentType()
                        );

        return ResponseEntity.ok(
                ConcertPosterUploadUrlResponse.from(
                        result
                )
        );
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            "/{concertId}/poster"
    )
    public ResponseEntity<Void> updatePoster(
            @PathVariable
            Long concertId,

            @Valid
            @RequestBody
            UpdateConcertPosterRequest request
    ) {
        updateConcertPosterService.update(
                concertId,
                request.objectKey()
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(
            "/{concertId}/poster"
    )
    public ResponseEntity<Void> deletePoster(
            @PathVariable
            Long concertId
    ) {
        deleteConcertPosterService.delete(
                concertId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}
