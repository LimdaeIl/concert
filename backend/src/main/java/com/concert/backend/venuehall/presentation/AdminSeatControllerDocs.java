package com.concert.backend.venuehall.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import com.concert.backend.venuehall.presentation.request.BulkCreateSeatRequest;
import com.concert.backend.venuehall.presentation.request.UpdateSeatRequest;
import com.concert.backend.venuehall.presentation.request.UpdateSeatStatusRequest;
import com.concert.backend.venuehall.presentation.response.GetAdminSeatsResponse;
import com.concert.backend.venuehall.presentation.response.GetSeatsResponse;
import com.concert.backend.venuehall.presentation.response.SeatResponse;
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
import org.springframework.web.bind.annotation.RequestParam;

@Tag(
        name = "Admin Seat",
        description = "관리자 공연홀 좌석 관리 API"
)
public interface AdminSeatControllerDocs {

    @Operation(
            summary = "좌석 일괄 생성",
            description = """
                    관리자가 공연홀에 여러 좌석을 한 번에 생성합니다.

                    동일 공연홀 내에서
                    구역, 층, 열, 좌석번호의 조합은 고유해야 합니다.

                    기존 좌석 수와 새로 생성할 좌석 수의 합은
                    공연홀 최대 수용 인원을 초과할 수 없습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "좌석 일괄 생성 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = GetSeatsResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = """
                    입력값 오류, 이용할 수 없는 공연홀,
                    공연홀 최대 수용 인원 초과
                    """,
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연홀을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "409",
            description = "동일한 위치의 좌석이 이미 존재함",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetSeatsResponse> bulkCreate(
            @Parameter(
                    description = "공연홀 ID",
                    example = "1"
            )
            @PathVariable Long venueHallId,

            @Valid
            @RequestBody
            BulkCreateSeatRequest request
    );

    @Operation(
            summary = "좌석 정보 수정",
            description = """
                    관리자가 좌석의 구역, 층, 열,
                    좌석번호 및 좌석 유형을 수정합니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "좌석 수정 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = SeatResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "입력값 오류",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "좌석을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "409",
            description = "수정하려는 위치에 다른 좌석이 이미 존재함",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<SeatResponse> update(
            @Parameter(
                    description = "좌석 ID",
                    example = "1"
            )
            @PathVariable Long seatId,

            @Valid
            @RequestBody
            UpdateSeatRequest request
    );

    @Operation(
            summary = "좌석 상태 변경",
            description = """
                    좌석 상태를 ACTIVE, INACTIVE,
                    MAINTENANCE 중 하나로 변경합니다.

                    ACTIVE 상태가 아닌 좌석은
                    일반 사용자 좌석 조회에서 노출되지 않습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "좌석 상태 변경 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = SeatResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "상태값 오류 또는 현재 상태와 동일한 상태 요청",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "좌석을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<SeatResponse> updateStatus(
            @Parameter(
                    description = "좌석 ID",
                    example = "1"
            )
            @PathVariable Long seatId,

            @Valid
            @RequestBody
            UpdateSeatStatusRequest request
    );

    @Operation(
            summary = "관리자 좌석 목록 조회",
            description = """
                관리자가 특정 공연홀의 좌석을
                페이지 단위로 조회합니다.

                검색어는 좌석 구역명, 열,
                좌석번호에 적용됩니다.

                층, 좌석 유형, 좌석 상태
                필터링을 지원합니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "좌석 목록 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    GetAdminSeatsResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation =
                                    ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연홀을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation =
                                    ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetAdminSeatsResponse>
    getSeats(
            @Parameter(
                    description = "공연홀 ID",
                    example = "1"
            )
            @PathVariable
            Long venueHallId,

            @Parameter(
                    description = "구역명, 열, 좌석번호 검색어",
                    example = "A"
            )
            @RequestParam(required = false)
            String keyword,

            @Parameter(
                    description = "좌석 층",
                    example = "1"
            )
            @RequestParam(required = false)
            Short floor,

            @Parameter(
                    description = "좌석 유형"
            )
            @RequestParam(required = false)
            SeatType seatType,

            @Parameter(
                    description = "좌석 상태"
            )
            @RequestParam(required = false)
            SeatStatus status,

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
}
