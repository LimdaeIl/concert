package com.concert.backend.reservation.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.reservation.presentation.request.CreateReservationRequest;
import com.concert.backend.reservation.presentation.response.GetReservationsResponse;
import com.concert.backend.reservation.presentation.response.ReservationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(
        name = "Reservation",
        description = "공연 예약 관리 API"
)
public interface ReservationControllerDocs {

    @Operation(
            summary = "예약 생성",
            description = """
                    공연 회차의 좌석을 선택하여 예약을 생성합니다.
                    선택한 좌석은 결제 완료 전까지 임시 선점됩니다.
                    회원별 최대 예매 가능 매수를 초과할 수 없습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "예약 생성 성공",
            content = @Content(
                    schema = @Schema(
                            implementation =
                                    ReservationResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "좌석 선택 또는 최대 예매 매수 오류"
    )
    @ApiResponse(
            responseCode = "409",
            description = "예매 불가능한 회차 또는 이미 선점된 좌석",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<ReservationResponse> create(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @PathVariable
            Long performanceId,

            @Valid
            @RequestBody
            CreateReservationRequest request
    );

    @Operation(
            summary = "내 예약 목록 조회",
            description = "로그인 회원의 예약 목록을 최신순으로 조회합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    ResponseEntity<GetReservationsResponse>
    getMyReservations(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember
    );

    @Operation(
            summary = "예약 상세 조회",
            description = "본인의 예약 상세 정보를 조회합니다.",
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "예약 상세 조회 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "예약을 찾을 수 없음"
    )
    ResponseEntity<ReservationResponse> getReservation(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "예약 ID",
                    example = "1"
            )
            @PathVariable
            Long reservationId
    );

    @Operation(
            summary = "예약 취소",
            description = """
                    본인의 예약을 취소합니다.
                    결제 대기 예약의 좌석 선점은 즉시 해제됩니다.
                    결제 완료 예약 취소는 결제 연동 단계에서
                    결제 취소 흐름과 결합됩니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "예약 취소 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "예약을 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "취소할 수 없는 예약 상태"
    )
    ResponseEntity<ReservationResponse> cancel(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "예약 ID",
                    example = "1"
            )
            @PathVariable
            Long reservationId
    );
}
