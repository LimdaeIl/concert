package com.concert.backend.performance.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.performance.presentation.response.GetPerformancesResponse;
import com.concert.backend.performance.presentation.response.PerformanceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(
        name = "Performance",
        description = "공연 회차 조회 API"
)
public interface PerformanceControllerDocs {

    @Operation(
            summary = "공연 회차 목록 조회",
            description = """
                    공개된 공연에 속한 회차 중
                    SCHEDULED, OPEN, SOLD_OUT 상태의 회차를
                    공연 시작일시 순으로 조회합니다.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 회차 목록 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    GetPerformancesResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연을 찾을 수 없거나 공개되지 않음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetPerformancesResponse> getPerformances(
            @Parameter(
                    description = "공연 ID",
                    example = "1"
            )
            @PathVariable Long concertId
    );

    @Operation(
            summary = "공연 회차 상세 조회",
            description = "사용자에게 공개 가능한 공연 회차의 상세 정보를 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 회차 상세 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    PerformanceResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "회차 또는 공개 공연을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<PerformanceResponse> getPerformance(
            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @PathVariable Long performanceId
    );
}
