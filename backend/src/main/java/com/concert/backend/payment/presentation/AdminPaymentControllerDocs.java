package com.concert.backend.payment.presentation;

import com.concert.backend.common.response.ErrorResponse;
import com.concert.backend.payment.presentation.request.AdminRefundPaymentRequest;
import com.concert.backend.payment.presentation.response.PaymentResponse;
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
        name = "Admin Payment",
        description = "관리자 결제 및 환불 관리 API"
)
public interface AdminPaymentControllerDocs {

    @Operation(
            summary = "관리자 결제 환불",
            description = """
                    관리자가 완료된 결제를 전체 환불합니다.

                    공연 시작 여부와 관계없이 관리자는 환불을 수행할 수 있습니다.

                    공연 시작 전 환불:
                    - 결제 환불
                    - 예약 취소
                    - 예약 좌석을 다시 AVAILABLE 상태로 복구

                    공연 시작 후 환불:
                    - 결제 환불
                    - 예약 취소
                    - 이미 시작된 공연이므로 좌석은 RESERVED 상태를 유지
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "관리자 결제 환불 성공",
            content = @Content(
                    schema = @Schema(
                            implementation = PaymentResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "잘못된 환불 요청",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(
                            implementation = ErrorResponse.class
                    )
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "인증 필요"
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 필요"
    )
    @ApiResponse(
            responseCode = "404",
            description = "결제 또는 예약 정보를 찾을 수 없음"
    )
    @ApiResponse(
            responseCode = "409",
            description = "환불할 수 없는 결제 상태"
    )
    @ApiResponse(
            responseCode = "502",
            description = "외부 결제 제공자 환불 처리 실패"
    )
    ResponseEntity<PaymentResponse> refund(
            @Parameter(
                    description = "결제 ID",
                    example = "1"
            )
            @PathVariable
            Long paymentId,

            @Valid
            @RequestBody
            AdminRefundPaymentRequest request
    );
}
