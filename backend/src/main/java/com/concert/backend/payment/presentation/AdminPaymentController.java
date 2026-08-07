package com.concert.backend.payment.presentation;

import com.concert.backend.payment.application.AdminRefundPaymentService;
import com.concert.backend.payment.application.result.PaymentResult;
import com.concert.backend.payment.presentation.request.AdminRefundPaymentRequest;
import com.concert.backend.payment.presentation.response.PaymentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/payments")
@RestController
public class AdminPaymentController {

    private final AdminRefundPaymentService
            adminRefundPaymentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refund(
            @PathVariable
            Long paymentId,

            @Valid
            @RequestBody
            AdminRefundPaymentRequest request
    ) {
        PaymentResult result =
                adminRefundPaymentService.refund(
                        paymentId,
                        request.reason(),
                        request.providerData()
                );

        return ResponseEntity.ok(
                PaymentResponse.from(result)
        );
    }
}
