package com.concert.backend.performance.presentation;

import com.concert.backend.performance.presentation.response.GetPerformanceSeatsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
        name = "Performance Seat",
        description = "공연 회차별 좌석 조회 API"
)
public interface PerformanceSeatControllerDocs {

    @Operation(
            summary = "공연 회차 좌석 조회",
            description = """
                    공연 회차에 구성된 좌석과
                    좌석 위치, 등급, 가격, 현재 판매 상태를 조회합니다.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 좌석 조회 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    GetPerformanceSeatsResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연 회차를 찾을 수 없음"
    )
    ResponseEntity<GetPerformanceSeatsResponse> getSeats(
            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @PathVariable Long performanceId
    );
}
