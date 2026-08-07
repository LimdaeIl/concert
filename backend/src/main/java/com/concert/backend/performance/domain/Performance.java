package com.concert.backend.performance.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
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

    private Performance(
            Long concertId,
            Long venueHallId,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            LocalDateTime reservationOpensAt,
            LocalDateTime reservationClosesAt,
            Integer maxTicketsPerMember
    ) {
        this.concertId = requireId(concertId);
        this.venueHallId = requireId(venueHallId);

        validatePeriod(
                startsAt,
                endsAt,
                reservationOpensAt,
                reservationClosesAt
        );

        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.reservationOpensAt = reservationOpensAt;
        this.reservationClosesAt = reservationClosesAt;
        this.maxTicketsPerMember =
                requireMaxTickets(maxTicketsPerMember);

        this.status = PerformanceStatus.SCHEDULED;
    }


    public static Performance create(
            Long concertId,
            Long venueHallId,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            LocalDateTime reservationOpensAt,
            LocalDateTime reservationClosesAt,
            Integer maxTicketsPerMember
    ) {
        return new Performance(
                concertId,
                venueHallId,
                startsAt,
                endsAt,
                reservationOpensAt,
                reservationClosesAt,
                maxTicketsPerMember
        );
    }

    public void update(
            Long venueHallId,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            LocalDateTime reservationOpensAt,
            LocalDateTime reservationClosesAt,
            Integer maxTicketsPerMember
    ) {
        validateEditable();

        validatePeriod(
                startsAt,
                endsAt,
                reservationOpensAt,
                reservationClosesAt
        );

        this.venueHallId = requireId(venueHallId);
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.reservationOpensAt = reservationOpensAt;
        this.reservationClosesAt = reservationClosesAt;
        this.maxTicketsPerMember =
                requireMaxTickets(maxTicketsPerMember);
    }

    public void changeStatus(
            PerformanceStatus newStatus
    ) {
        if (newStatus == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.PERFORMANCE_STATUS_REQUIRED
            );
        }

        if (status == newStatus) {
            throw new PerformanceException(
                    PerformanceErrorCode.SAME_PERFORMANCE_STATUS
            );
        }

        if (!canChangeStatusTo(newStatus)) {
            throw new PerformanceException(
                    PerformanceErrorCode.INVALID_PERFORMANCE_STATUS_TRANSITION
            );
        }

        this.status = newStatus;
    }

    private boolean canChangeStatusTo(
            PerformanceStatus newStatus
    ) {
        return switch (status) {
            case SCHEDULED ->
                    newStatus == PerformanceStatus.OPEN
                            || newStatus == PerformanceStatus.CANCELLED;

            case OPEN ->
                    newStatus == PerformanceStatus.SOLD_OUT
                            || newStatus == PerformanceStatus.COMPLETED
                            || newStatus == PerformanceStatus.CANCELLED;

            case SOLD_OUT ->
                    newStatus == PerformanceStatus.OPEN
                            || newStatus == PerformanceStatus.COMPLETED
                            || newStatus == PerformanceStatus.CANCELLED;

            case COMPLETED, CANCELLED -> false;
        };
    }

    private static void validatePeriod(
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            LocalDateTime reservationOpensAt,
            LocalDateTime reservationClosesAt
    ) {
        if (startsAt == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.STARTS_AT_REQUIRED
            );
        }

        if (endsAt == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.ENDS_AT_REQUIRED
            );
        }

        if (reservationOpensAt == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.RESERVATION_OPENS_AT_REQUIRED
            );
        }

        if (reservationClosesAt == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.RESERVATION_CLOSES_AT_REQUIRED
            );
        }

        if (!endsAt.isAfter(startsAt)) {
            throw new PerformanceException(
                    PerformanceErrorCode.INVALID_PERFORMANCE_PERIOD
            );
        }

        if (!reservationClosesAt.isAfter(
                reservationOpensAt
        )) {
            throw new PerformanceException(
                    PerformanceErrorCode.INVALID_RESERVATION_PERIOD
            );
        }

        if (reservationClosesAt.isAfter(startsAt)) {
            throw new PerformanceException(
                    PerformanceErrorCode.INVALID_RESERVATION_CLOSE_TIME
            );
        }
    }
    private static Long requireId(Long id) {
        if (id == null || id <= 0) {
            throw new PerformanceException(
                    PerformanceErrorCode.PERFORMANCE_NOT_FOUND
            );
        }

        return id;
    }
    private void validateEditable() {
        if (status == PerformanceStatus.COMPLETED
                || status == PerformanceStatus.CANCELLED) {
            throw new PerformanceException(
                    PerformanceErrorCode.PERFORMANCE_NOT_EDITABLE
            );
        }
    }

    private static Integer requireMaxTickets(
            Integer value
    ) {
        if (value == null || value <= 0) {
            throw new PerformanceException(
                    PerformanceErrorCode.INVALID_MAX_TICKETS_PER_MEMBER
            );
        }

        return value;
    }

}
