package com.concert.backend.reservation.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
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
        name = "v1_reservations",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_reservations_number",
                columnNames = "reservation_number"
        ),
        indexes = {
                @Index(name = "idx_v1_reservations_member_created_at", columnList = "member_id,created_at"),
                @Index(name = "idx_v1_reservations_member_status", columnList = "member_id,status"),
                @Index(name = "idx_v1_reservations_performance_status", columnList = "performance_id,status"),
                @Index(name = "idx_v1_reservations_status_expires_at", columnList = "status,expires_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_number", nullable = false, length = 30)
    private String reservationNumber;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "performance_id", nullable = false)
    private Long performanceId;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReservationStatus status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Version
    @Column(nullable = false)
    private Long version;

    @OneToMany(
            mappedBy = "reservation",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private final List<ReservationSeat> seats = new ArrayList<>();
}
