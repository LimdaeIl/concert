package com.concert.backend.venue.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.venue.presentation.response.GetVenuesResponse;
import com.concert.backend.venue.presentation.response.VenueResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(
        name = "Venue",
        description = "공연장 조회 API"
)
public interface VenueControllerDocs {

    @Operation(
            summary = "공연장 목록 조회",
            description = "등록된 공연장 목록을 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연장 목록 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = GetVenuesResponse.class
                    )
            )
    )
    ResponseEntity<GetVenuesResponse> getVenues();

    @Operation(
            summary = "공연장 상세 조회",
            description = "공연장 ID를 이용하여 공연장 상세 정보를 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연장 상세 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VenueResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연장을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<VenueResponse> getVenue(
            @Parameter(
                    description = "공연장 ID",
                    example = "1"
            )
            @PathVariable
            Long venueId
    );
}
