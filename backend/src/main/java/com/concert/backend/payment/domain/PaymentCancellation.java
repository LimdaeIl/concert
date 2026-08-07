package com.concert.backend.payment.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_payment_cancellations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_v1_payment_cancellations_number",
                        columnNames = "cancellation_number"
                ),
                @UniqueConstraint(
                        name = "uk_v1_payment_cancellations_provider",
                        columnNames = "provider_cancellation_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_v1_payment_cancellations_payment",
                        columnList = "payment_id"
                ),
                @Index(
                        name = "idx_v1_payment_cancellations_status_created_at",
                        columnList = "status,created_at"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentCancellation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "payment_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_v1_payment_cancellations_payment"
            )
    )
    private Payment payment;

    @Column(
            name = "cancellation_number",
            nullable = false,
            length = 30
    )
    private String cancellationNumber;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(
            name = "provider_cancellation_id",
            length = 200
    )
    private String providerCancellationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentCancellationStatus status;

    @Column(
            name = "requested_at",
            nullable = false
    )
    private LocalDateTime requestedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    private PaymentCancellation(
            Payment payment,
            String cancellationNumber,
            Long amount,
            String reason,
            LocalDateTime requestedAt
    ) {
        this.payment = requirePayment(payment);
        this.cancellationNumber =
                requireCancellationNumber(
                        cancellationNumber
                );
        this.amount = requireAmount(amount);
        this.reason = requireReason(reason);
        this.requestedAt =
                requireRequestedAt(requestedAt);

        this.status =
                PaymentCancellationStatus.REQUESTED;
    }

    public static PaymentCancellation create(
            Payment payment,
            String cancellationNumber,
            Long amount,
            String reason,
            LocalDateTime requestedAt
    ) {
        return new PaymentCancellation(
                payment,
                cancellationNumber,
                amount,
                reason,
                requestedAt
        );
    }

    public void complete(
            String providerCancellationId,
            LocalDateTime completedAt
    ) {
        if (status
                != PaymentCancellationStatus.REQUESTED) {
            throw new PaymentException(
                    PaymentErrorCode
                            .INVALID_PAYMENT_CANCELLATION_STATUS
            );
        }

        if (providerCancellationId == null
                || providerCancellationId.isBlank()) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PROVIDER_CANCELLATION_ID_REQUIRED
            );
        }

        if (completedAt == null) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CANCELLATION_COMPLETED_AT_REQUIRED
            );
        }

        this.providerCancellationId =
                providerCancellationId;

        this.completedAt = completedAt;

        this.status =
                PaymentCancellationStatus.COMPLETED;
    }

    public void fail() {
        if (status
                != PaymentCancellationStatus.REQUESTED) {
            return;
        }

        this.status =
                PaymentCancellationStatus.FAILED;
    }

    public boolean isRequested() {
        return status
                == PaymentCancellationStatus.REQUESTED;
    }

    public boolean isCompleted() {
        return status
                == PaymentCancellationStatus.COMPLETED;
    }

    private static Payment requirePayment(
            Payment payment
    ) {
        if (payment == null) {
            throw new PaymentException(
                    PaymentErrorCode.PAYMENT_NOT_FOUND
            );
        }

        return payment;
    }

    private static String requireCancellationNumber(
            String cancellationNumber
    ) {
        if (cancellationNumber == null
                || cancellationNumber.isBlank()) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CANCELLATION_NUMBER_REQUIRED
            );
        }

        return cancellationNumber.trim();
    }

    private static Long requireAmount(
            Long amount
    ) {
        if (amount == null || amount <= 0) {
            throw new PaymentException(
                    PaymentErrorCode
                            .INVALID_PAYMENT_CANCELLATION_AMOUNT
            );
        }

        return amount;
    }

    private static String requireReason(
            String reason
    ) {
        if (reason == null || reason.isBlank()) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CANCELLATION_REASON_REQUIRED
            );
        }

        return reason.trim();
    }

    private static LocalDateTime requireRequestedAt(
            LocalDateTime requestedAt
    ) {
        if (requestedAt == null) {
            throw new PaymentException(
                    PaymentErrorCode
                            .PAYMENT_CANCELLATION_REQUESTED_AT_REQUIRED
            );
        }

        return requestedAt;
    }
}
