package com.concert.backend.payment.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.payment.application.CancelPaymentService;
import com.concert.backend.payment.application.ConfirmPaymentService;
import com.concert.backend.payment.application.PreparePaymentService;
import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.presentation.request.CancelPaymentRequest;
import com.concert.backend.payment.presentation.request.ConfirmPaymentRequest;
import com.concert.backend.payment.presentation.request.PreparePaymentRequest;
import com.concert.backend.payment.presentation.response.PaymentResponse;
import com.concert.backend.payment.presentation.response.PreparePaymentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1")
@RestController
public class PaymentController {

    private final PreparePaymentService
            preparePaymentService;

    private final ConfirmPaymentService
            confirmPaymentService;

    private final CancelPaymentService
            cancelPaymentService;

    @PostMapping(
            "/reservations/{reservationId}/payments"
    )
    public ResponseEntity<PreparePaymentResponse> prepare(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long reservationId,

            @Valid
            @RequestBody
            PreparePaymentRequest request
    ) {
        PaymentResult result =
                preparePaymentService.prepare(
                        loginMember.memberId(),
                        reservationId,
                        request.toCommand()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        PreparePaymentResponse.from(
                                result
                        )
                );
    }

    @PostMapping(
            "/payments/{paymentId}/confirm"
    )
    public ResponseEntity<PaymentResponse> confirm(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long paymentId,

            @Valid
            @RequestBody
            ConfirmPaymentRequest request
    ) {
        PaymentResult result =
                confirmPaymentService.confirm(
                        loginMember.memberId(),
                        paymentId,
                        request.amount(),
                        request.providerData()
                );

        return ResponseEntity.ok(
                PaymentResponse.from(result)
        );
    }
    @PostMapping(
            "/payments/{paymentId}/cancel"
    )
    public ResponseEntity<PaymentResponse> cancel(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long paymentId,

            @Valid
            @RequestBody
            CancelPaymentRequest request
    ) {
        PaymentResult result =
                cancelPaymentService.cancel(
                        loginMember.memberId(),
                        paymentId,
                        request.reason(),
                        request.providerData()
                );

        return ResponseEntity.ok(
                PaymentResponse.from(result)
        );
    }
}
