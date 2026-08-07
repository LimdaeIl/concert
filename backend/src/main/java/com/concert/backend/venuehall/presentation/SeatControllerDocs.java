package com.concert.backend.venuehall.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.venuehall.presentation.response.GetSeatsResponse;
import com.concert.backend.venuehall.presentation.response.SeatResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(
        name = "Seat",
        description = "공연홀 좌석 조회 API"
)
public interface SeatControllerDocs {

    @Operation(
            summary = "공연홀 좌석 목록 조회",
            description = """
                    ACTIVE 상태의 공연홀에 등록된
                    ACTIVE 상태의 좌석 목록을 조회합니다.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "좌석 목록 조회 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = GetSeatsResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연홀 또는 공연장을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetSeatsResponse> getSeats(
            @Parameter(
                    description = "공연홀 ID",
                    example = "1"
            )
            @PathVariable Long venueHallId
    );

    @Operation(
            summary = "좌석 상세 조회",
            description = "ACTIVE 상태의 좌석 상세 정보를 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "좌석 상세 조회 성공",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = SeatResponse.class
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
    ResponseEntity<SeatResponse> getSeat(
            @Parameter(
                    description = "좌석 ID",
                    example = "1"
            )
            @PathVariable Long seatId
    );
}
