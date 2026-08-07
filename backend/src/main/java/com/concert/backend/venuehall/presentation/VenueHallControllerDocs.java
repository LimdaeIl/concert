package com.concert.backend.venuehall.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.venuehall.presentation.response.GetVenueHallsResponse;
import com.concert.backend.venuehall.presentation.response.VenueHallResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(
        name = "Venue Hall",
        description = "공연홀 조회 API"
)
public interface VenueHallControllerDocs {

    @Operation(
            summary = "공연장별 공연홀 목록 조회",
            description = """
                    ACTIVE 상태의 공연장에 속한
                    ACTIVE 상태의 공연홀 목록을 조회합니다.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연홀 목록 조회 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = GetVenueHallsResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연장을 찾을 수 없거나 이용할 수 없는 상태",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetVenueHallsResponse> getVenueHalls(
            @Parameter(
                    description = "공연장 ID",
                    example = "1"
            )
            @PathVariable Long venueId
    );

    @Operation(
            summary = "공연홀 상세 조회",
            description = """
                    ACTIVE 상태의 공연홀 상세 정보를 조회합니다.
                    소속 공연장 역시 ACTIVE 상태여야 합니다.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연홀 상세 조회 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = VenueHallResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연홀 또는 소속 공연장을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<VenueHallResponse> getVenueHall(
            @Parameter(
                    description = "공연홀 ID",
                    example = "1"
            )
            @PathVariable Long venueHallId
    );
}
