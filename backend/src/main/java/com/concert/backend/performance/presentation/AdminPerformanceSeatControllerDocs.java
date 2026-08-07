package com.concert.backend.performance.presentation;

import com.concert.backend.performance.presentation.request.BulkCreatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatStatusRequest;
import com.concert.backend.performance.presentation.response.GetPerformanceSeatsResponse;
import com.concert.backend.performance.presentation.response.PerformanceSeatResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(
        name = "Admin Performance Seat",
        description = "관리자 공연 회차별 좌석 관리 API"
)
public interface AdminPerformanceSeatControllerDocs {

    @Operation(
            summary = "공연 좌석 일괄 생성",
            description = """
                    공연홀의 물리 좌석을 특정 공연 회차의 판매 좌석으로 등록합니다.
                    각 좌석별 판매 등급과 가격을 지정합니다.
                    SCHEDULED 상태의 회차에서만 구성할 수 있습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "공연 좌석 일괄 생성 성공"
    )
    @ApiResponse(
            responseCode = "409",
            description = "중복 좌석 또는 좌석 구성 불가능한 회차"
    )
    ResponseEntity<GetPerformanceSeatsResponse> bulkCreate(
            @PathVariable Long performanceId,
            @Valid @RequestBody
            BulkCreatePerformanceSeatRequest request
    );

    @Operation(
            summary = "공연 좌석 정보 수정",
            description = """
                    공연 좌석의 등급과 가격을 수정합니다.
                    HELD 또는 RESERVED 좌석은 수정할 수 없습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    ResponseEntity<PerformanceSeatResponse> update(
            @PathVariable Long performanceSeatId,
            @Valid @RequestBody
            UpdatePerformanceSeatRequest request
    );

    @Operation(
            summary = "공연 좌석 상태 변경",
            description = """
                    관리자가 판매 좌석을 AVAILABLE 또는 BLOCKED로 변경합니다.
                    HELD와 RESERVED는 예약 시스템만 변경할 수 있습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    ResponseEntity<PerformanceSeatResponse> updateStatus(
            @PathVariable Long performanceSeatId,
            @Valid @RequestBody
            UpdatePerformanceSeatStatusRequest request
    );
}
