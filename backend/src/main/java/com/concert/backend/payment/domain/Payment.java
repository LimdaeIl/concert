package com.concert.backend.payment.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_payments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_v1_payments_number",
                        columnNames = "payment_number"
                ),
                @UniqueConstraint(
                        name = "uk_v1_payments_provider_payment",
                        columnNames = {"provider", "provider_payment_id"}
                )
        },
        indexes = {
                @Index(name = "idx_v1_payments_reservation_created_at", columnList = "reservation_id,created_at"),
                @Index(name = "idx_v1_payments_status_created_at", columnList = "status,created_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_number", nullable = false, length = 30)
    private String paymentNumber;

    @Column(name = "reservation_id", nullable = false)
    private Long reservationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentMethod method;

    @Column(name = "provider_payment_id", length = 200)
    private String providerPaymentId;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status;

    @Column(name = "failure_code", length = 100)
    private String failureCode;

    @Column(name = "failure_message", length = 500)
    private String failureMessage;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Version
    @Column(nullable = false)
    private Long version;

    @OneToMany(
            mappedBy = "payment",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private final List<PaymentCancellation> cancellations = new ArrayList<>();

    private Payment(
            String paymentNumber,
            Long reservationId,
            PaymentProvider provider,
            Long amount,
            LocalDateTime requestedAt
    ) {
        this.paymentNumber =
                requirePaymentNumber(paymentNumber);

        this.reservationId =
                requireReservationId(reservationId);

        this.provider =
                requireProvider(provider);

        this.method = null;

        this.amount =
                requireAmount(amount);

        if (requestedAt == null) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_REQUESTED_AT_REQUIRED
            );
        }

        this.requestedAt = requestedAt;
        this.status = PaymentStatus.READY;
    }

    public static Payment create(
            String paymentNumber,
            Long reservationId,
            PaymentProvider provider,
            Long amount,
            LocalDateTime requestedAt
    ) {
        return new Payment(
                paymentNumber,
                reservationId,
                provider,
                amount,
                requestedAt
        );
    }

    public void startConfirmation() {
        if (status != PaymentStatus.READY) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_NOT_CONFIRMABLE
            );
        }

        this.status = PaymentStatus.IN_PROGRESS;
        clearFailure();
    }

    public void complete(
            String providerPaymentId,
            PaymentMethod method,
            LocalDateTime approvedAt
    ) {
        if (status != PaymentStatus.IN_PROGRESS) {
            throw new PaymentException(
                    PaymentErrorCode.INVALID_PAYMENT_STATUS
            );
        }

        if (providerPaymentId == null
                || providerPaymentId.isBlank()) {
            throw new PaymentException(
                    PaymentErrorCode.PROVIDER_PAYMENT_ID_REQUIRED
            );
        }

        if (method == null) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_METHOD_REQUIRED
            );
        }

        if (approvedAt == null) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_APPROVED_AT_REQUIRED
            );
        }

        this.providerPaymentId =
                providerPaymentId;

        this.method = method;
        this.approvedAt = approvedAt;
        this.status = PaymentStatus.PAID;

        clearFailure();
    }

    public void fail(
            String failureCode,
            String failureMessage
    ) {
        if (status != PaymentStatus.IN_PROGRESS) {
            throw new PaymentException(
                    PaymentErrorCode.INVALID_PAYMENT_STATUS
            );
        }

        this.status = PaymentStatus.FAILED;
        this.failureCode = normalize(failureCode);
        this.failureMessage =
                normalize(failureMessage);
    }

    public boolean isReady() {
        return status == PaymentStatus.READY;
    }

    public boolean isInProgress() {
        return status == PaymentStatus.IN_PROGRESS;
    }

    public boolean isPaid() {
        return status == PaymentStatus.PAID;
    }

    private static String requirePaymentNumber(
            String paymentNumber
    ) {
        if (paymentNumber == null
                || paymentNumber.isBlank()) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_NUMBER_REQUIRED
            );
        }

        return paymentNumber;
    }

    private static Long requireReservationId(
            Long reservationId
    ) {
        if (reservationId == null
                || reservationId <= 0) {
            throw new PaymentException(
                    PaymentErrorCode.RESERVATION_REQUIRED
            );
        }

        return reservationId;
    }

    private static PaymentProvider requireProvider(
            PaymentProvider provider
    ) {
        if (provider == null) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_PROVIDER_REQUIRED
            );
        }

        return provider;
    }

    private static PaymentMethod requireMethod(
            PaymentMethod method
    ) {
        if (method == null) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_METHOD_REQUIRED
            );
        }

        return method;
    }

    private static Long requireAmount(Long amount) {
        if (amount == null || amount < 0) {
            throw new PaymentException(
                    PaymentErrorCode.INVALID_PAYMENT_AMOUNT
            );
        }

        return amount;
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private void clearFailure() {
        failureCode = null;
        failureMessage = null;
    }


    public void cancel(

            LocalDateTime cancelledAt
    ) {

        if (status != PaymentStatus.PAID
                && status != PaymentStatus.PARTIAL_CANCELLED) {

            throw new PaymentException(
                    PaymentErrorCode.INVALID_PAYMENT_STATUS
            );
        }

        this.status = PaymentStatus.CANCELLED;
        this.cancelledAt = cancelledAt;
    }

    public PaymentCancellation requestCancellation(
            String cancellationNumber,
            Long amount,
            String reason,
            LocalDateTime requestedAt
    ) {
        validateCancellationAllowed(amount);

        PaymentCancellation cancellation =
                PaymentCancellation.create(
                        this,
                        cancellationNumber,
                        amount,
                        reason,
                        requestedAt
                );

        cancellations.add(cancellation);

        return cancellation;
    }

    public void completeCancellation(
            PaymentCancellation cancellation,
            String providerCancellationId,
            LocalDateTime completedAt
    ) {
        if (cancellation == null
                || !cancellations.contains(cancellation)) {
            throw new PaymentException(
                    PaymentErrorCode
                            .INVALID_PAYMENT_CANCELLATION_STATUS
            );
        }

        cancellation.complete(
                providerCancellationId,
                completedAt
        );

        long cancelledAmount =
                calculateCompletedCancellationAmount();

        if (cancelledAmount == amount) {
            this.status = PaymentStatus.CANCELLED;
            this.cancelledAt = completedAt;

            return;
        }

        if (cancelledAmount > 0
                && cancelledAmount < amount) {
            this.status =
                    PaymentStatus.PARTIAL_CANCELLED;

            return;
        }

        throw new PaymentException(
                PaymentErrorCode
                        .PAYMENT_CANCELLATION_AMOUNT_EXCEEDED
        );
    }

    public void failCancellation(
            PaymentCancellation cancellation
    ) {
        if (cancellation == null
                || !cancellations.contains(cancellation)) {
            return;
        }

        cancellation.fail();
    }

    private void validateCancellationAllowed(
            Long cancelAmount
    ) {
        if (status != PaymentStatus.PAID
                && status
                != PaymentStatus.PARTIAL_CANCELLED) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_NOT_CANCELLABLE
            );
        }

        if (cancelAmount == null
                || cancelAmount <= 0) {
            throw new PaymentException(
                    PaymentErrorCode
                            .INVALID_PAYMENT_CANCELLATION_AMOUNT
            );
        }

        if (cancelAmount > getCancellableAmount()) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CANCELLATION_AMOUNT_EXCEEDED
            );
        }
    }

    public Long getCancellableAmount() {
        return amount
                - calculateCompletedCancellationAmount();
    }

    private long calculateCompletedCancellationAmount() {
        return cancellations.stream()
                .filter(
                        PaymentCancellation::isCompleted
                )
                .mapToLong(
                        PaymentCancellation::getAmount
                )
                .sum();
    }


}
