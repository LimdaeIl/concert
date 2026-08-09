package com.concert.backend.booking.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.booking.presentation.response.GetReservationContextResponse;
import com.concert.backend.common.response.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(
        name = "My Performance Reservation",
        description = "로그인 회원의 공연 회차별 예매 가능 상태 조회 API"
)
public interface MyPerformanceReservationControllerDocs {

    @Operation(
            summary = "공연 회차 예매 상태 조회",
            description = """
                    로그인 회원이 특정 공연 회차에서
                    현재 추가로 예매할 수 있는 좌석 수와
                    결제 대기 중인 예약 정보를 조회합니다.

                    다음 정보를 제공합니다.
                    - 1인 최대 예매 가능 매수
                    - 현재 회원이 이미 예매한 매수
                    - 추가 예매 가능 매수
                    - 결제 대기 중인 예약 정보

                    결제 대기 중인 예약이 존재하는 경우,
                    기존 예약을 결제하거나 취소한 뒤
                    새로운 좌석을 선택해야 합니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "공연 회차 예매 상태 조회 성공"
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 필요",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "공연 회차를 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<GetReservationContextResponse>
    getReservationContext(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "공연 회차 ID",
                    example = "5"
            )
            @PathVariable
            Long performanceId
    );
}
