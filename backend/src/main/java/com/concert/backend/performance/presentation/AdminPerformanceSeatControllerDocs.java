package com.concert.backend.performance.presentation;

import com.concert.backend.performance.domain.PerformanceSeatStatus;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.performance.presentation.request.BulkCreatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatRequest;
import com.concert.backend.performance.presentation.request.UpdatePerformanceSeatStatusRequest;
import com.concert.backend.performance.presentation.response.GetAdminPerformanceSeatCandidatesResponse;
import com.concert.backend.performance.presentation.response.GetAdminPerformanceSeatsResponse;
import com.concert.backend.performance.presentation.response.GetPerformanceSeatsResponse;
import com.concert.backend.performance.presentation.response.PerformanceSeatResponse;
import com.concert.backend.venuehall.domain.SeatType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

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

    @Operation(
            summary = "관리자 공연 판매 좌석 목록 조회",
            description = """
                관리자가 특정 공연 회차의 판매 좌석을
                페이지 단위로 조회합니다.

                구역명, 열, 좌석번호 검색과
                층, 판매 등급, 물리 좌석 유형,
                공연 좌석 상태 필터링을 지원합니다.

                AVAILABLE, HELD, RESERVED,
                BLOCKED 상태를 모두 조회합니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 판매 좌석 목록 조회 성공"
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연 회차를 찾을 수 없음"
    )
    ResponseEntity<GetAdminPerformanceSeatsResponse>
    getSeats(
            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @PathVariable
            Long performanceId,

            @Parameter(
                    description = "구역명, 열, 좌석번호 검색어",
                    example = "A"
            )
            @RequestParam(required = false)
            String keyword,

            @Parameter(
                    description = "층",
                    example = "1"
            )
            @RequestParam(required = false)
            Short floor,

            @Parameter(
                    description = "판매 좌석 등급"
            )
            @RequestParam(required = false)
            SeatGrade grade,

            @Parameter(
                    description = "물리 좌석 유형"
            )
            @RequestParam(required = false)
            SeatType seatType,

            @Parameter(
                    description = "공연 좌석 상태"
            )
            @RequestParam(required = false)
            PerformanceSeatStatus status,

            @Parameter(
                    description = "페이지 번호 (0부터 시작)",
                    example = "0"
            )
            @RequestParam(defaultValue = "0")
            int page,

            @Parameter(
                    description = "페이지 크기",
                    example = "20"
            )
            @RequestParam(defaultValue = "20")
            int size
    );

    @Operation(
            summary = "관리자 공연 판매 좌석 후보 목록 조회",
            description = """
                관리자가 특정 공연 회차에
                새롭게 등록할 수 있는 물리 좌석을
                페이지 단위로 조회합니다.

                해당 공연 회차의 공연홀에 속하고,
                ACTIVE 상태이며,
                아직 해당 공연 회차의 판매 좌석으로
                등록되지 않은 좌석만 조회합니다.

                구역명, 열, 좌석번호 검색과
                층, 물리 좌석 유형 필터링을 지원합니다.

                공연 회차가 SCHEDULED 상태일 때만
                조회할 수 있습니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 판매 좌석 후보 목록 조회 성공"
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연 회차를 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "판매 좌석을 구성할 수 없는 공연 회차 상태"
    )
    ResponseEntity<GetAdminPerformanceSeatCandidatesResponse>
    getCandidateSeats(
            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @PathVariable
            Long performanceId,

            @Parameter(
                    description = "구역명, 열, 좌석번호 검색어",
                    example = "A"
            )
            @RequestParam(required = false)
            String keyword,

            @Parameter(
                    description = "층",
                    example = "1"
            )
            @RequestParam(required = false)
            Short floor,

            @Parameter(
                    description = "물리 좌석 유형",
                    example = "STANDARD"
            )
            @RequestParam(required = false)
            SeatType seatType,

            @Parameter(
                    description = "페이지 번호 (0부터 시작)",
                    example = "0"
            )
            @RequestParam(defaultValue = "0")
            int page,

            @Parameter(
                    description = "페이지 크기",
                    example = "50"
            )
            @RequestParam(defaultValue = "50")
            int size
    );

}
