package com.concert.backend.performance.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.performance.presentation.request.CreatePerformanceRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceStatusRequest;
import com.concert.backend.performance.presentation.response.PerformanceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(
        name = "Admin Performance",
        description = "관리자 공연 회차 관리 API"
)
public interface AdminPerformanceControllerDocs {

    @Operation(
            summary = "공연 회차 생성",
            description = """
                    공개된 공연에 새로운 공연 회차를 생성합니다.
                    공연장과 공연홀은 ACTIVE 상태여야 하며,
                    동일 공연홀의 기존 회차와 시간이 겹칠 수 없습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "공연 회차 생성 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    PerformanceResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "공연/예매 기간 또는 최대 예매 매수 오류",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "409",
            description = """
                    공개되지 않은 공연, 이용 불가능한 공연홀,
                    또는 같은 공연홀의 시간 충돌
                    """,
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<PerformanceResponse> create(
            @Parameter(
                    description = "공연 ID",
                    example = "1"
            )
            @PathVariable Long concertId,

            @Valid
            @RequestBody
            CreatePerformanceRequest request
    );

    @Operation(
            summary = "공연 회차 수정",
            description = """
                    공연홀, 공연 시간, 예매 기간,
                    회원별 최대 예매 매수를 수정합니다.
                    다른 회차와 시간이 겹칠 수 없습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 회차 수정 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연 회차를 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "수정 불가능한 상태 또는 공연홀 시간 충돌"
    )
    ResponseEntity<PerformanceResponse> update(
            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @PathVariable Long performanceId,

            @Valid
            @RequestBody
            UpdatePerformanceRequest request
    );

    @Operation(
            summary = "공연 회차 상태 변경",
            description = """
                    허용되는 주요 상태 전이:

                    SCHEDULED → OPEN, CANCELLED
                    OPEN → SOLD_OUT, COMPLETED, CANCELLED
                    SOLD_OUT → OPEN, COMPLETED, CANCELLED

                    COMPLETED와 CANCELLED는 최종 상태입니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 회차 상태 변경 성공"
    )
    @ApiResponse(
            responseCode = "400",
            description = "상태 누락 또는 동일 상태 요청"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연 회차를 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "허용되지 않은 상태 전이"
    )
    ResponseEntity<PerformanceResponse> updateStatus(
            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @PathVariable Long performanceId,

            @Valid
            @RequestBody
            UpdatePerformanceStatusRequest request
    );
}
