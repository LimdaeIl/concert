package com.concert.backend.payment.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.payment.presentation.request.CancelPaymentRequest;
import com.concert.backend.payment.presentation.request.ConfirmPaymentRequest;
import com.concert.backend.payment.presentation.request.PreparePaymentRequest;
import com.concert.backend.payment.presentation.response.PaymentResponse;
import com.concert.backend.payment.presentation.response.PreparePaymentResponse;
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
        name = "Payment",
        description = "결제 준비, 승인 및 취소 API"
)
public interface PaymentControllerDocs {

    @Operation(
            summary = "결제 준비",
            description = """
                    본인의 결제 대기 예약에 대한 결제를 준비합니다.

                    서버가 결제번호와 결제금액을 생성하며,
                    결제금액은 예약의 총 금액을 기준으로 결정됩니다.

                    결제 제공자는 TOSS, PORTONE 등
                    지원되는 결제 Provider를 선택할 수 있습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "201",
            description = "결제 준비 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = PreparePaymentResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "예약을 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "결제할 수 없는 예약 상태 또는 기존 활성 결제가 존재함"
    )
    ResponseEntity<PreparePaymentResponse> prepare(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "예약 ID",
                    example = "1"
            )
            @PathVariable
            Long reservationId,

            @Valid
            @RequestBody
            PreparePaymentRequest request
    );


    @Operation(
            summary = "결제 승인",
            description = """
                    외부 결제 제공자에서 인증이 완료된 결제를 최종 승인합니다.

                    결제 Provider에 맞는 승인 정보를 providerData로 전달합니다.

                    승인 성공 시:
                    - Payment: PAID
                    - Reservation: COMPLETED
                    - PerformanceSeat: RESERVED

                    상태로 변경됩니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "결제 승인 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = PaymentResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "잘못된 결제 승인 요청"
    )
    @ApiResponse(
            responseCode = "404",
            description = "결제를 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "승인할 수 없는 결제 또는 예약 상태"
    )
    @ApiResponse(
            responseCode = "502",
            description = "외부 결제 제공자 승인 실패",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    ResponseEntity<PaymentResponse> confirm(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "결제 ID",
                    example = "1"
            )
            @PathVariable
            Long paymentId,

            @Valid
            @RequestBody
            ConfirmPaymentRequest request
    );


    @Operation(
            summary = "결제 취소",
            description = """
                    본인의 완료된 결제를 전체 취소합니다.

                    사용자 결제 취소는 공연 시작 전에만 가능합니다.

                    취소 성공 시:
                    - 외부 PG 결제 전체 취소
                    - Payment: CANCELLED
                    - PaymentCancellation: COMPLETED
                    - Reservation: CANCELLED
                    - 예약 좌석: AVAILABLE

                    공연 시작 이후에는 사용자가 직접 취소할 수 없으며
                    관리자 환불 API를 통해서만 처리할 수 있습니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "결제 취소 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = PaymentResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "잘못된 결제 취소 요청"
    )
    @ApiResponse(
            responseCode = "404",
            description = "결제 또는 예약을 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "취소 불가능한 결제 상태 또는 공연이 이미 시작됨"
    )
    @ApiResponse(
            responseCode = "502",
            description = "외부 결제 제공자 취소 실패"
    )
    ResponseEntity<PaymentResponse> cancel(
            @Parameter(hidden = true)
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Parameter(
                    description = "결제 ID",
                    example = "1"
            )
            @PathVariable
            Long paymentId,

            @Valid
            @RequestBody
            CancelPaymentRequest request
    );
}
