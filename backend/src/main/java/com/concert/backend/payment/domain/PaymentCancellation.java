package com.concert.backend.payment.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
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
                @Index(name = "idx_v1_payment_cancellations_payment", columnList = "payment_id"),
                @Index(name = "idx_v1_payment_cancellations_status_created_at", columnList = "status,created_at")
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
            foreignKey = @ForeignKey(name = "fk_v1_payment_cancellations_payment")
    )
    private Payment payment;

    @Column(name = "cancellation_number", nullable = false, length = 30)
    private String cancellationNumber;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(name = "provider_cancellation_id", length = 200)
    private String providerCancellationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentCancellationStatus status;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

}
