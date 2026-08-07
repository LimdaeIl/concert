package com.concert.backend.payment.domain;

public sealed interface PaymentProviderData
        permits TossPaymentProviderData, PortOnePaymentProviderData {
}
