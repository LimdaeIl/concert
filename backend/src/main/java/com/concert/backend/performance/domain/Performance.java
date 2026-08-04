package com.concert.backend.performance.domain;

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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_performances",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_performances_hall_starts_at",
                columnNames = {"venue_hall_id", "starts_at"}
        ),
        indexes = {
                @Index(name = "idx_v1_performances_concert_starts_at", columnList = "concert_id,starts_at"),
                @Index(name = "idx_v1_performances_hall_starts_at", columnList = "venue_hall_id,starts_at"),
                @Index(name = "idx_v1_performances_status_starts_at", columnList = "status,starts_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Performance extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "concert_id", nullable = false)
    private Long concertId;

    @Column(name = "venue_hall_id", nullable = false)
    private Long venueHallId;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private LocalDateTime endsAt;

    @Column(name = "reservation_opens_at", nullable = false)
    private LocalDateTime reservationOpensAt;

    @Column(name = "reservation_closes_at", nullable = false)
    private LocalDateTime reservationClosesAt;

    @Column(name = "max_tickets_per_member", nullable = false)
    private Integer maxTicketsPerMember;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PerformanceStatus status;

    @OneToMany(
            mappedBy = "performance",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private final List<PerformanceSeat> seats = new ArrayList<>();

}
