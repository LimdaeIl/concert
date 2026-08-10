package com.concert.backend.venuehall.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.venuehall.domain.VenueHallStatus;
import com.concert.backend.venuehall.presentation.request.CreateVenueHallRequest;
import com.concert.backend.venuehall.presentation.request.UpdateVenueHallRequest;
import com.concert.backend.venuehall.presentation.request.UpdateVenueHallStatusRequest;
import com.concert.backend.venuehall.presentation.response.GetAdminVenueHallsResponse;
import com.concert.backend.venuehall.presentation.response.VenueHallResponse;
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
        name = "Admin Venue Hall",
        description = "관리자 공연홀 관리 API"
)
public interface AdminVenueHallControllerDocs {

    @Operation(
            summary = "공연홀 생성",
            description = """
                    관리자가 공연장에 새로운 공연홀을 등록합니다.
                    ACTIVE 상태의 공연장에만 공연홀을 생성할 수 있습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "공연홀 생성 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VenueHallResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "입력값 오류 또는 이용할 수 없는 공연장",
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
            description = "공연장을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "409",
            description = "같은 공연장에 동일한 이름의 공연홀이 존재함",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<VenueHallResponse> create(
            @Parameter(
                    description = "공연장 ID",
                    example = "1"
            )
            @PathVariable Long venueId,

            @Valid
            @RequestBody
            CreateVenueHallRequest request
    );

    @Operation(
            summary = "공연홀 정보 수정",
            description = "관리자가 공연홀의 이름, 층, 수용 인원을 수정합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연홀 수정 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VenueHallResponse.class
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
            description = "같은 공연장에 동일한 이름의 다른 공연홀이 존재함",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<VenueHallResponse> update(
            @Parameter(
                    description = "공연홀 ID",
                    example = "1"
            )
            @PathVariable Long venueHallId,

            @Valid
            @RequestBody
            UpdateVenueHallRequest request
    );

    @Operation(
            summary = "공연홀 상태 변경",
            description = """
                    공연홀 상태를 ACTIVE, INACTIVE, MAINTENANCE 중 하나로 변경합니다.
                    ACTIVE가 아닌 공연홀은 일반 사용자 조회에서 노출되지 않습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연홀 상태 변경 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VenueHallResponse.class
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
            description = "공연홀을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<VenueHallResponse> updateStatus(
            @Parameter(
                    description = "공연홀 ID",
                    example = "1"
            )
            @PathVariable Long venueHallId,

            @Valid
            @RequestBody
            UpdateVenueHallStatusRequest request
    );
    @Operation(
            summary = "관리자 공연홀 목록 조회",
            description = """
                관리자가 특정 공연장에 속한 공연홀을
                페이지 단위로 조회합니다.

                공연홀명 검색 및 상태 필터링을 지원합니다.
                ACTIVE, INACTIVE, MAINTENANCE 상태를 모두 조회할 수 있습니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연홀 목록 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    GetAdminVenueHallsResponse.class
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
            description = "공연장을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation =
                                    ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetAdminVenueHallsResponse>
    getVenueHalls(
            @Parameter(
                    description = "공연장 ID",
                    example = "1"
            )
            @PathVariable
            Long venueId,

            @Parameter(
                    description = "공연홀 이름 검색어",
                    example = "올림픽"
            )
            @RequestParam(required = false)
            String keyword,

            @Parameter(
                    description = "공연홀 상태"
            )
            @RequestParam(required = false)
            VenueHallStatus status,

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
