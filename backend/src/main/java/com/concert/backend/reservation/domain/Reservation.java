package com.concert.backend.reservation.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
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
import java.util.Collections;
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
                @Index(
                        name = "idx_v1_reservations_member_created_at",
                        columnList = "member_id,created_at"
                ),
                @Index(
                        name = "idx_v1_reservations_member_status",
                        columnList = "member_id,status"
                ),
                @Index(
                        name = "idx_v1_reservations_performance_status",
                        columnList = "performance_id,status"
                ),
                @Index(
                        name = "idx_v1_reservations_status_expires_at",
                        columnList = "status,expires_at"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "reservation_number",
            nullable = false,
            length = 30
    )
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
    private final List<ReservationSeat> reservationSeats =
            new ArrayList<>();

    private Reservation(
            String reservationNumber,
            Long memberId,
            Long performanceId,
            LocalDateTime expiresAt
    ) {
        this.reservationNumber =
                requireReservationNumber(
                        reservationNumber
                );

        this.memberId = requireMemberId(memberId);
        this.performanceId =
                requirePerformanceId(performanceId);

        if (expiresAt == null) {
            throw new ReservationException(
                    ReservationErrorCode.EXPIRES_AT_REQUIRED
            );
        }

        this.expiresAt = expiresAt;
        this.totalAmount = 0L;
        this.status =
                ReservationStatus.PENDING_PAYMENT;
    }

    public static Reservation create(
            String reservationNumber,
            Long memberId,
            Long performanceId,
            LocalDateTime expiresAt
    ) {
        return new Reservation(
                reservationNumber,
                memberId,
                performanceId,
                expiresAt
        );
    }

    public void addSeat(
            ReservationSeat reservationSeat
    ) {
        if (reservationSeat == null) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_SEAT_REQUIRED
            );
        }

        boolean duplicate = reservationSeats.stream()
                .anyMatch(existing ->
                        existing.getPerformanceSeatId()
                                .equals(
                                        reservationSeat
                                                .getPerformanceSeatId()
                                )
                );

        if (duplicate) {
            throw new ReservationException(
                    ReservationErrorCode.DUPLICATE_RESERVATION_SEAT
            );
        }

        reservationSeats.add(reservationSeat);

        try {
            totalAmount = Math.addExact(
                    totalAmount,
                    reservationSeat.getPrice()
            );
        } catch (ArithmeticException exception) {
            throw new ReservationException(
                    ReservationErrorCode.TOTAL_AMOUNT_OVERFLOW,
                    exception
            );
        }
    }

    public void complete(
            LocalDateTime completedAt
    ) {
        if (status != ReservationStatus.PENDING_PAYMENT) {
            throw new ReservationException(
                    ReservationErrorCode.INVALID_RESERVATION_STATUS
            );
        }

        if (completedAt == null) {
            throw new ReservationException(
                    ReservationErrorCode.COMPLETED_AT_REQUIRED
            );
        }

        if (completedAt.isAfter(expiresAt)) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_EXPIRED
            );
        }

        this.status = ReservationStatus.COMPLETED;
        this.completedAt = completedAt;
    }

    public void cancel(
            LocalDateTime cancelledAt
    ) {
        if (status != ReservationStatus.PENDING_PAYMENT
                && status != ReservationStatus.COMPLETED) {
            throw new ReservationException(
                    ReservationErrorCode.INVALID_RESERVATION_STATUS
            );
        }

        if (cancelledAt == null) {
            throw new ReservationException(
                    ReservationErrorCode.CANCELLED_AT_REQUIRED
            );
        }

        this.status = ReservationStatus.CANCELLED;
        this.cancelledAt = cancelledAt;
    }

    public void expire(LocalDateTime now) {
        if (now == null) {
            throw new ReservationException(
                    ReservationErrorCode.EXPIRATION_TIME_REQUIRED
            );
        }

        if (status != ReservationStatus.PENDING_PAYMENT) {
            throw new ReservationException(
                    ReservationErrorCode.INVALID_RESERVATION_STATUS
            );
        }

        if (now.isBefore(expiresAt)) {
            throw new ReservationException(
                    ReservationErrorCode.INVALID_RESERVATION_STATUS
            );
        }

        status = ReservationStatus.EXPIRED;
    }

    public boolean isOwnedBy(Long memberId) {
        return this.memberId.equals(memberId);
    }

    public boolean isPendingPayment() {
        return status == ReservationStatus.PENDING_PAYMENT;
    }

    public boolean isCompleted() {
        return status == ReservationStatus.COMPLETED;
    }

    public boolean isExpired(LocalDateTime now) {
        return isPendingPayment()
                && !now.isBefore(expiresAt);
    }

    public List<ReservationSeat> getReservationSeats() {
        return Collections.unmodifiableList(
                reservationSeats
        );
    }

    private static String requireReservationNumber(
            String value
    ) {
        if (value == null || value.isBlank()) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_NUMBER_REQUIRED
            );
        }

        return value;
    }

    private static Long requireMemberId(Long value) {
        if (value == null || value <= 0) {
            throw new ReservationException(
                    ReservationErrorCode.MEMBER_REQUIRED
            );
        }

        return value;
    }

    private static Long requirePerformanceId(
            Long value
    ) {
        if (value == null || value <= 0) {
            throw new ReservationException(
                    ReservationErrorCode.PERFORMANCE_REQUIRED
            );
        }

        return value;
    }
}
