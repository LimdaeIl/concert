package com.concert.backend.payment.infrastructure.toss;

import com.concert.backend.payment.domain.PaymentGateway;
import com.concert.backend.payment.domain.PaymentGatewayApprovalCommand;
import com.concert.backend.payment.domain.PaymentGatewayApprovalResult;
import com.concert.backend.payment.domain.PaymentGatewayCancellationCommand;
import com.concert.backend.payment.domain.PaymentGatewayCancellationResult;
import com.concert.backend.payment.domain.PaymentGatewayException;
import com.concert.backend.payment.domain.PaymentMethod;
import com.concert.backend.payment.domain.PaymentProvider;
import com.concert.backend.payment.infrastructure.toss.dto.TossCancelPaymentRequest;
import com.concert.backend.payment.infrastructure.toss.dto.TossCancelPaymentResponse;
import com.concert.backend.payment.infrastructure.toss.dto.TossConfirmPaymentRequest;
import com.concert.backend.payment.infrastructure.toss.dto.TossErrorResponse;
import com.concert.backend.payment.infrastructure.toss.dto.TossPaymentResponse;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

@Component
public class TossPaymentGateway implements PaymentGateway {

    private static final String PAYMENT_KEY =
            "paymentKey";

    private static final String ORDER_ID =
            "orderId";

    private final RestClient tossPaymentsRestClient;
    private final ObjectMapper objectMapper;

    public TossPaymentGateway(
            @Qualifier("tossPaymentsRestClient")
            RestClient tossPaymentsRestClient,
            ObjectMapper objectMapper
    ) {
        this.tossPaymentsRestClient =
                tossPaymentsRestClient;

        this.objectMapper =
                objectMapper;
    }

    @Override
    public PaymentProvider supports() {
        return PaymentProvider.TOSS;
    }

    @Override
    public PaymentGatewayApprovalResult approve(
            PaymentGatewayApprovalCommand command
    ) {
        String paymentKey =
                requireProviderData(
                        command.providerData(),
                        PAYMENT_KEY
                );

        String orderId =
                requireProviderData(
                        command.providerData(),
                        ORDER_ID
                );

        validateOrderId(
                command.paymentNumber(),
                orderId
        );

        TossConfirmPaymentRequest request =
                new TossConfirmPaymentRequest(
                        paymentKey,
                        orderId,
                        command.amount()
                );

        TossPaymentResponse response =
                requestApproval(request);

        validateResponse(
                command,
                paymentKey,
                orderId,
                response
        );

        return new PaymentGatewayApprovalResult(
                response.paymentKey(),
                response.totalAmount(),
                mapMethod(response.method()),
                resolveApprovedAt(response)
        );
    }

    private TossPaymentResponse requestApproval(
            TossConfirmPaymentRequest request
    ) {
        TossPaymentResponse response =
                tossPaymentsRestClient
                        .post()
                        .uri("/v1/payments/confirm")
                        .body(request)
                        .retrieve()
                        .onStatus(
                                HttpStatusCode::isError,
                                (httpRequest, httpResponse) -> {
                                    throw createGatewayException(
                                            httpResponse.getBody()
                                                    .readAllBytes()
                                    );
                                }
                        )
                        .body(
                                TossPaymentResponse.class
                        );

        if (response == null) {
            throw new PaymentGatewayException(
                    "TOSS_EMPTY_RESPONSE",
                    "토스페이먼츠 결제 승인 응답이 비어 있습니다."
            );
        }

        return response;
    }

    private PaymentGatewayException createGatewayException(
            byte[] responseBody
    ) {
        try {
            TossErrorResponse error =
                    objectMapper.readValue(
                            responseBody,
                            TossErrorResponse.class
                    );

            return new PaymentGatewayException(
                    error.code(),
                    error.message()
            );

        } catch (RuntimeException exception) {
            return new PaymentGatewayException(
                    "TOSS_INVALID_ERROR_RESPONSE",
                    "토스페이먼츠 오류 응답을 처리할 수 없습니다.",
                    exception
            );
        }
    }

    private void validateResponse(
            PaymentGatewayApprovalCommand command,
            String requestedPaymentKey,
            String requestedOrderId,
            TossPaymentResponse response
    ) {
        if (response.paymentKey() == null
                || !requestedPaymentKey.equals(
                response.paymentKey()
        )) {
            throw new PaymentGatewayException(
                    "TOSS_PAYMENT_KEY_MISMATCH",
                    "토스페이먼츠 결제 키가 일치하지 않습니다."
            );
        }

        if (response.orderId() == null
                || !requestedOrderId.equals(
                response.orderId()
        )) {
            throw new PaymentGatewayException(
                    "TOSS_ORDER_ID_MISMATCH",
                    "토스페이먼츠 주문번호가 일치하지 않습니다."
            );
        }

        if (response.totalAmount() == null
                || !command.amount().equals(
                response.totalAmount()
        )) {
            throw new PaymentGatewayException(
                    "TOSS_AMOUNT_MISMATCH",
                    "토스페이먼츠 승인 금액이 일치하지 않습니다."
            );
        }

        if (!"DONE".equals(response.status())) {
            throw new PaymentGatewayException(
                    "TOSS_PAYMENT_NOT_DONE",
                    "토스페이먼츠 결제가 완료 상태가 아닙니다."
            );
        }
    }

    private void validateOrderId(
            String paymentNumber,
            String orderId
    ) {
        if (!paymentNumber.equals(orderId)) {
            throw new PaymentGatewayException(
                    "TOSS_ORDER_ID_MISMATCH",
                    "토스페이먼츠 주문번호가 결제번호와 일치하지 않습니다."
            );
        }
    }

    private String requireProviderData(
            Map<String, String> providerData,
            String key
    ) {
        if (providerData == null) {
            throw new PaymentGatewayException(
                    "TOSS_PROVIDER_DATA_REQUIRED",
                    "토스페이먼츠 결제 승인 정보가 필요합니다."
            );
        }

        String value = providerData.get(key);

        if (value == null || value.isBlank()) {
            throw new PaymentGatewayException(
                    "TOSS_PROVIDER_DATA_INVALID",
                    "토스페이먼츠 결제 승인 정보가 올바르지 않습니다."
            );
        }

        return value;
    }

    private PaymentMethod mapMethod(
            String tossMethod
    ) {
        if (tossMethod == null
                || tossMethod.isBlank()) {
            throw new PaymentGatewayException(
                    "TOSS_PAYMENT_METHOD_REQUIRED",
                    "토스페이먼츠 결제수단 정보가 없습니다."
            );
        }

        return switch (tossMethod) {
            case "카드" -> PaymentMethod.CARD;

            case "계좌이체" -> PaymentMethod.TRANSFER;

            case "가상계좌" -> PaymentMethod.VIRTUAL_ACCOUNT;

            case "간편결제" -> PaymentMethod.EASY_PAY;

            default -> throw new PaymentGatewayException(
                    "TOSS_UNSUPPORTED_PAYMENT_METHOD",
                    "지원하지 않는 토스페이먼츠 결제수단입니다: "
                            + tossMethod
            );
        };
    }

    private LocalDateTime resolveApprovedAt(
            TossPaymentResponse response
    ) {
        if (response.approvedAt() == null) {
            throw new PaymentGatewayException(
                    "TOSS_APPROVED_AT_REQUIRED",
                    "토스페이먼츠 승인 시각이 없습니다."
            );
        }

        return response.approvedAt()
                .toLocalDateTime();
    }


    @Override
    public PaymentGatewayCancellationResult cancel(
            PaymentGatewayCancellationCommand command
    ) {
        if (command.providerPaymentId() == null
                || command.providerPaymentId().isBlank()) {
            throw new PaymentGatewayException(
                    "TOSS_PAYMENT_KEY_REQUIRED",
                    "토스페이먼츠 paymentKey가 필요합니다."
            );
        }

        TossCancelPaymentRequest request =
                new TossCancelPaymentRequest(
                        command.amount(),
                        command.reason()
                );

        TossCancelPaymentResponse response =
                requestCancellation(
                        command.providerPaymentId(),
                        request
                );

        TossCancelPaymentResponse.TossCancelInfo cancel =
                findCompletedCancellation(
                        command.amount(),
                        response
                );

        return new PaymentGatewayCancellationResult(
                cancel.transactionKey(),
                cancel.cancelAmount(),
                cancel.canceledAt()
                        .toLocalDateTime()
        );
    }

    private TossCancelPaymentResponse requestCancellation(
            String paymentKey,
            TossCancelPaymentRequest request
    ) {
        TossCancelPaymentResponse response =
                tossPaymentsRestClient
                        .post()
                        .uri(
                                "/v1/payments/{paymentKey}/cancel",
                                paymentKey
                        )
                        .body(request)
                        .retrieve()
                        .onStatus(
                                HttpStatusCode::isError,
                                (httpRequest, httpResponse) -> {
                                    throw createGatewayException(
                                            httpResponse
                                                    .getBody()
                                                    .readAllBytes()
                                    );
                                }
                        )
                        .body(
                                TossCancelPaymentResponse.class
                        );

        if (response == null) {
            throw new PaymentGatewayException(
                    "TOSS_CANCEL_EMPTY_RESPONSE",
                    "토스페이먼츠 취소 응답이 비어 있습니다."
            );
        }

        return response;
    }

    private TossCancelPaymentResponse.TossCancelInfo
    findCompletedCancellation(
            Long requestedAmount,
            TossCancelPaymentResponse response
    ) {
        if (response.cancels() == null
                || response.cancels().isEmpty()) {
            throw new PaymentGatewayException(
                    "TOSS_CANCEL_RESULT_NOT_FOUND",
                    "토스페이먼츠 취소 결과를 찾을 수 없습니다."
            );
        }

        return response.cancels()
                .stream()
                .filter(cancel ->
                        requestedAmount.equals(
                                cancel.cancelAmount()
                        )
                )
                .filter(cancel ->
                        "DONE".equals(
                                cancel.cancelStatus()
                        )
                )
                .findFirst()
                .orElseThrow(() ->
                        new PaymentGatewayException(
                                "TOSS_CANCEL_NOT_COMPLETED",
                                "토스페이먼츠 결제 취소가 완료되지 않았습니다."
                        )
                );
    }

}
