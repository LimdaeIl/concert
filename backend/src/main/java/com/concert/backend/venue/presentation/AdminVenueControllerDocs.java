package com.concert.backend.venue.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.venue.presentation.request.CreateVenueRequest;
import com.concert.backend.venue.presentation.request.UpdateVenueRequest;
import com.concert.backend.venue.presentation.request.UpdateVenueStatusRequest;
import com.concert.backend.venue.presentation.response.CreateVenueResponse;
import com.concert.backend.venue.presentation.response.VenueResponse;
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
        name = "Admin Venue",
        description = "관리자 공연장 관리 API"
)
public interface AdminVenueControllerDocs {

    @Operation(
            summary = "공연장 생성",
            description = "관리자가 새로운 공연장을 등록합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "공연장 생성 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = CreateVenueResponse.class
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
            responseCode = "401",
            description = "인증 정보 없음 또는 유효하지 않은 Access Token",
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
            responseCode = "409",
            description = "동일한 이름과 주소의 공연장이 이미 존재함",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<CreateVenueResponse> create(
            @Valid @RequestBody CreateVenueRequest request
    );

    @Operation(
            summary = "공연장 정보 수정",
            description = "관리자가 공연장 이름, 전화번호 및 주소 정보를 수정합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연장 수정 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VenueResponse.class
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
            description = "동일한 이름과 주소의 다른 공연장이 이미 존재함",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<VenueResponse> update(
            @Parameter(
                    description = "공연장 ID",
                    example = "1"
            )
            @PathVariable Long venueId,

            @Valid
            @RequestBody
            UpdateVenueRequest request
    );

    @Operation(
            summary = "공연장 상태 변경",
            description = """
                    관리자가 공연장 상태를 ACTIVE 또는 INACTIVE로 변경합니다.
                    INACTIVE 공연장은 일반 사용자 조회 API에서 노출되지 않습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연장 상태 변경 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = VenueResponse.class
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
            description = "공연장을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<VenueResponse> updateStatus(
            @Parameter(
                    description = "공연장 ID",
                    example = "1"
            )
            @PathVariable Long venueId,

            @Valid
            @RequestBody
            UpdateVenueStatusRequest request
    );
}
