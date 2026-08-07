package com.concert.backend.payment.exception;

import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PaymentErrorCode implements ErrorCode {

    PAYMENT_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "결제 정보를 찾을 수 없습니다."
    ),

    PAYMENT_NUMBER_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "결제 번호는 필수입니다."
    ),

    RESERVATION_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "예약 정보는 필수입니다."
    ),

    PAYMENT_PROVIDER_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "결제 제공자는 필수입니다."
    ),

    PAYMENT_METHOD_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "결제 수단은 필수입니다."
    ),

    INVALID_PAYMENT_AMOUNT(
            HttpStatus.BAD_REQUEST,
            "결제 금액은 0원 이상이어야 합니다."
    ),

    PAYMENT_REQUESTED_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "결제 요청일시는 필수입니다."
    ),

    PROVIDER_PAYMENT_ID_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "결제사 거래 ID는 필수입니다."
    ),

    PAYMENT_ALREADY_EXISTS(
            HttpStatus.CONFLICT,
            "해당 예약에 진행 가능한 결제가 이미 존재합니다."
    ),

    PAYMENT_NOT_CONFIRMABLE(
            HttpStatus.CONFLICT,
            "현재 상태의 결제는 승인할 수 없습니다."
    ),

    PAYMENT_ALREADY_COMPLETED(
            HttpStatus.CONFLICT,
            "이미 완료된 결제입니다."
    ),

    PAYMENT_APPROVED_AT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "결제 승인일시는 필수입니다."
    ),

    INVALID_PAYMENT_STATUS(
            HttpStatus.CONFLICT,
            "현재 결제 상태에서는 요청한 작업을 수행할 수 없습니다."
    ),

    PAYMENT_AMOUNT_MISMATCH(
            HttpStatus.CONFLICT,
            "결제 승인 금액이 예약 금액과 일치하지 않습니다."
    ),

    PAYMENT_PROVIDER_MISMATCH(
            HttpStatus.CONFLICT,
            "결제 제공자가 일치하지 않습니다."
    ),

    PAYMENT_CONFIRMATION_FAILED(
            HttpStatus.BAD_GATEWAY,
            "결제 승인 처리에 실패했습니다."
    ),

    PAYMENT_CONFLICT(
            HttpStatus.CONFLICT,
            "결제가 동시에 처리되었습니다. 결제 상태를 다시 확인해주세요."
    ),
    UNSUPPORTED_PAYMENT_METHOD(
            HttpStatus.BAD_REQUEST,
            "지원하지 않는 결제수단입니다."
    ),

    PAYMENT_ORDER_ID_MISMATCH(
            HttpStatus.CONFLICT,
            "결제 주문번호가 일치하지 않습니다."
    ),
    PAYMENT_PROVIDER_NOT_SUPPORTED(
            HttpStatus.BAD_REQUEST,
            "지원하지 않는 결제 제공자입니다."
    );

    private final HttpStatus status;
    private final String message;

    @Override
    public HttpStatus status() {
        return status;
    }

    @Override
    public String message() {
        return message;
    }
}
