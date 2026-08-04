package com.concert.backend.performance.domain;

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
import jakarta.persistence.Version;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_performance_seats",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_performance_seats_performance_seat",
                columnNames = {"performance_id", "seat_id"}
        ),
        indexes = {
                @Index(name = "idx_v1_performance_seats_performance_status", columnList = "performance_id,status"),
                @Index(name = "idx_v1_performance_seats_performance_grade", columnList = "performance_id,grade"),
                @Index(name = "idx_v1_performance_seats_status_held_until", columnList = "status,held_until")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PerformanceSeat extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "performance_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_v1_performance_seats_performance")
    )
    private Performance performance;

    @Column(name = "seat_id", nullable = false)
    private Long seatId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatGrade grade;

    @Column(nullable = false)
    private Long price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PerformanceSeatStatus status;

    @Column(name = "held_by")
    private Long heldBy;

    @Column(name = "held_until")
    private LocalDateTime heldUntil;

    @Version
    @Column(nullable = false)
    private Long version;

}
