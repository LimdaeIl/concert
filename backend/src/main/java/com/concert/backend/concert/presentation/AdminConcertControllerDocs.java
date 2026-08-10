package com.concert.backend.concert.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.presentation.request.CreateConcertPosterUploadUrlRequest;
import com.concert.backend.concert.presentation.request.CreateConcertRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertPosterRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertRequest;
import com.concert.backend.concert.presentation.request.UpdateConcertStatusRequest;
import com.concert.backend.concert.presentation.response.ConcertPosterUploadUrlResponse;
import com.concert.backend.concert.presentation.response.ConcertResponse;
import com.concert.backend.concert.presentation.response.GetAdminConcertsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(
        name = "Admin Concert",
        description = "관리자 공연 관리 API"
)
public interface AdminConcertControllerDocs {

    @Operation(
            summary = "공연 생성",
            description = "새 공연을 DRAFT 상태로 생성합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "공연 생성 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = ConcertResponse.class
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
            description = "관리자 권한 없음"
    )
    ResponseEntity<ConcertResponse> create(
            @Valid @RequestBody CreateConcertRequest request
    );

    @Operation(
            summary = "공연 정보 수정",
            description = """
                    공연 기본 정보를 수정합니다.
                    CLOSED 또는 CANCELLED 상태의 공연은 수정할 수 없습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 수정 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연을 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "현재 상태에서는 공연을 수정할 수 없음"
    )
    ResponseEntity<ConcertResponse> update(
            @Parameter(
                    description = "공연 ID",
                    example = "1"
            )
            @PathVariable Long concertId,

            @Valid
            @RequestBody
            UpdateConcertRequest request
    );

    @Operation(
            summary = "공연 상태 변경",
            description = """
                    공연 상태를 변경합니다.

                    허용되는 상태 전이:
                    DRAFT → PUBLISHED 또는 CANCELLED
                    PUBLISHED → CLOSED 또는 CANCELLED

                    CLOSED와 CANCELLED는 최종 상태입니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 상태 변경 성공"
    )
    @ApiResponse(
            responseCode = "400",
            description = "상태값 누락 또는 현재 상태와 동일한 요청"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연을 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "허용되지 않은 상태 전이"
    )
    ResponseEntity<ConcertResponse> updateStatus(
            @Parameter(
                    description = "공연 ID",
                    example = "1"
            )
            @PathVariable Long concertId,

            @Valid
            @RequestBody
            UpdateConcertStatusRequest request
    );
    @Operation(
            summary = "관리자 공연 목록 조회",
            description = """
                관리자가 전체 공연을 페이지 단위로 조회합니다.

                공연 제목/부제 검색,
                카테고리 및 상태 필터링을 지원합니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 목록 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    GetAdminConcertsResponse.class
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
    ResponseEntity<GetAdminConcertsResponse>
    getConcerts(
            @Parameter(
                    description = "공연 제목 또는 부제 검색어"
            )
            @RequestParam(required = false)
            String keyword,

            @Parameter(
                    description = "공연 카테고리"
            )
            @RequestParam(required = false)
            ConcertCategory category,

            @Parameter(
                    description = "공연 상태"
            )
            @RequestParam(required = false)
            ConcertStatus status,

            @Parameter(
                    description = "페이지 번호 (0부터 시작)",
                    example = "0"
            )
            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @Parameter(
                    description = "페이지 크기",
                    example = "20"
            )
            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    );

    @Operation(
            summary = "공연 포스터 업로드 URL 발급",
            description = """
                공연 포스터 이미지를 S3에 직접 업로드할 수 있는
                Presigned PUT URL을 발급합니다.

                지원 이미지 형식:
                JPEG, PNG, WEBP
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "Presigned Upload URL 발급 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연을 찾을 수 없음"
    )
    ResponseEntity<ConcertPosterUploadUrlResponse>
    createPosterUploadUrl(
            @PathVariable
            Long concertId,

            @Valid
            @RequestBody
            CreateConcertPosterUploadUrlRequest request
    );


    @Operation(
            summary = "공연 포스터 적용",
            description = """
                S3 업로드가 완료된 Object Key를
                공연 포스터로 적용합니다.

                기존 포스터가 존재하면
                DB 트랜잭션 커밋 이후 기존 S3 Object를 삭제합니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "공연 포스터 적용 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연 또는 업로드된 이미지가 존재하지 않음"
    )
    ResponseEntity<Void> updatePoster(
            @PathVariable
            Long concertId,

            @Valid
            @RequestBody
            UpdateConcertPosterRequest request
    );


    @Operation(
            summary = "공연 포스터 삭제",
            description = """
                공연에 연결된 포스터를 제거합니다.

                DB 트랜잭션 커밋 이후
                실제 S3 Object도 삭제합니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "204",
            description = "공연 포스터 삭제 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연을 찾을 수 없음"
    )
    ResponseEntity<Void> deletePoster(
            @PathVariable
            Long concertId
    );

}
