package com.concert.backend.concert.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.concert.presentation.response.ConcertResponse;
import com.concert.backend.concert.presentation.response.GetConcertsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(
        name = "Concert",
        description = "공연 조회 API"
)
public interface ConcertControllerDocs {

    @Operation(
            summary = "공연 목록 조회",
            description = "현재 PUBLISHED 상태인 공연 목록을 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 목록 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = GetConcertsResponse.class
                    )
            )
    )
    ResponseEntity<GetConcertsResponse> getConcerts();

    @Operation(
            summary = "공연 상세 조회",
            description = "PUBLISHED 상태인 공연의 상세 정보를 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 상세 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = ConcertResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연을 찾을 수 없거나 공개되지 않은 공연",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<ConcertResponse> getConcert(
            @Parameter(
                    description = "공연 ID",
                    example = "1"
            )
            @PathVariable Long concertId
    );
}
