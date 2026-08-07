package com.concert.backend.booking.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.booking.presentation.request.GetMyReservationsRequest;
import com.concert.backend.booking.presentation.response.MyBookingDetailResponse;
import com.concert.backend.booking.presentation.response.MyBookingsResponse;
import com.concert.backend.common.response.ErrorResponse;
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
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(
        name = "My Booking",
        description = "내 공연 예약 및 결제 내역 조회 API"
)
public interface MyBookingControllerDocs {

    @Operation(
            summary = "내 예약 목록 조회",
            description = """
                로그인 회원의 공연 예약 목록을 조회합니다.

                예약 상태, 공연 진행상태, 공연명,
                예약 기간 조건으로 검색할 수 있습니다.

                지원하는 공연 진행 상태:
                - UPCOMING: 공연 시작 전
                - ONGOING: 공연 진행 중
                - ENDED: 공연 종료

                지원하는 정렬:
                - RESERVED_AT_DESC
                - RESERVED_AT_ASC
                - PERFORMANCE_DATE_DESC
                - PERFORMANCE_DATE_ASC
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "내 예약 목록 조회 성공"
    )
    ResponseEntity<MyBookingsResponse> getBookings(

            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "예약 목록 검색 조건"
            )
            @Valid
            @ModelAttribute
            GetMyReservationsRequest request
    );

    @Operation(
            summary = "내 예약 상세 조회",
            description = """
                로그인 회원 본인의 예약 상세 정보를 조회합니다.

                예약 정보와 함께 공연, 회차, 공연장,
                공연홀, 좌석, 최신 결제 및 결제 취소 정보를 제공합니다.
                """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "내 예약 상세 조회 성공"
    )
    @ApiResponse(
            responseCode = "404",
            description = "예약을 찾을 수 없음",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<MyBookingDetailResponse> getBooking(
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
