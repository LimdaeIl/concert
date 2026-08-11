package com.concert.backend.performance.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.venuehall.domain.Seat;
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
                columnNames = {
                        "performance_id",
                        "seat_id"
                }
        ),
        indexes = {
                @Index(
                        name = "idx_v1_performance_seats_performance_status",
                        columnList = "performance_id,status"
                ),
                @Index(
                        name = "idx_v1_performance_seats_performance_grade",
                        columnList = "performance_id,grade"
                ),
                @Index(
                        name = "idx_v1_performance_seats_status_held_until",
                        columnList = "status,held_until"
                )
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
            foreignKey = @ForeignKey(
                    name = "fk_v1_performance_seats_performance"
            )
    )
    private Performance performance;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seat_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_v1_performance_seats_seat"
            )
    )
    private Seat seat;

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

    private PerformanceSeat(
            Performance performance,
            Seat seat,
            SeatGrade grade,
            Long price
    ) {
        if (performance == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.PERFORMANCE_NOT_FOUND
            );
        }

        if (seat == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_FOUND
            );
        }

        this.performance = performance;
        this.seat = seat;
        this.grade = requireGrade(grade);
        this.price = requirePrice(price);
        this.status = PerformanceSeatStatus.AVAILABLE;
    }

    public static PerformanceSeat create(
            Performance performance,
            Seat seat,
            SeatGrade grade,
            Long price
    ) {
        return new PerformanceSeat(
                performance,
                seat,
                grade,
                price
        );
    }

    /*
     * 관리자용 가격/등급 수정
     */
    public void updateInformation(
            SeatGrade grade,
            Long price
    ) {
        validateAdministrativelyEditable();

        this.grade = requireGrade(grade);
        this.price = requirePrice(price);
    }

    /*
     * 관리자는 AVAILABLE/BLOCKED만 조작한다.
     * HELD/RESERVED는 예약 도메인 전용 상태다.
     */
    public void changeAdministrativeStatus(
            PerformanceSeatStatus newStatus
    ) {
        if (newStatus == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.PERFORMANCE_SEAT_STATUS_REQUIRED
            );
        }

        if (status == newStatus) {
            throw new PerformanceException(
                    PerformanceErrorCode.SAME_PERFORMANCE_SEAT_STATUS
            );
        }

        switch (newStatus) {
            case AVAILABLE -> unblock();
            case BLOCKED -> block();
            case HELD, RESERVED -> throw new PerformanceException(
                    PerformanceErrorCode.INVALID_ADMIN_SEAT_STATUS
            );
        }
    }

    public void hold(
            Long memberId,
            LocalDateTime heldUntil
    ) {
        if (!isAvailable()) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_AVAILABLE
            );
        }

        if (memberId == null || heldUntil == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_AVAILABLE
            );
        }

        this.status = PerformanceSeatStatus.HELD;
        this.heldBy = memberId;
        this.heldUntil = heldUntil;
    }

    public void reserve(
            Long memberId,
            LocalDateTime now
    ) {
        if (!isHeld()) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_HELD
            );
        }

        if (!heldBy.equals(memberId)) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_HELD_BY_ANOTHER_MEMBER
            );
        }

        if (heldUntil.isBefore(now)) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_HOLD_EXPIRED
            );
        }

        this.status = PerformanceSeatStatus.RESERVED;
        clearHold();
    }

    public void release(
            Long memberId
    ) {
        if (!isHeld()) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_HELD
            );
        }

        if (!heldBy.equals(memberId)) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_HELD_BY_ANOTHER_MEMBER
            );
        }

        this.status = PerformanceSeatStatus.AVAILABLE;
        clearHold();
    }

    /*
     * 만료 좌석 정리 배치에서 사용.
     */
    public void releaseExpired(
            Long memberId,
            LocalDateTime now
    ) {
        if (!isHeld()) {
            return;
        }

        if (heldBy == null
                || !heldBy.equals(memberId)) {
            return;
        }

        if (heldUntil == null
                || heldUntil.isAfter(now)) {
            return;
        }

        this.status =
                PerformanceSeatStatus.AVAILABLE;

        clearHold();
    }


    /*
     * 예약 취소 후 RESERVED → AVAILABLE.
     */
    public void cancelReservation() {
        if (!isReserved()) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_AVAILABLE
            );
        }

        this.status = PerformanceSeatStatus.AVAILABLE;
        clearHold();
    }

    public boolean isAvailable() {
        return status == PerformanceSeatStatus.AVAILABLE;
    }

    public boolean isHeld() {
        return status == PerformanceSeatStatus.HELD;
    }

    public boolean isReserved() {
        return status == PerformanceSeatStatus.RESERVED;
    }

    public boolean isBlocked() {
        return status == PerformanceSeatStatus.BLOCKED;
    }

    private void block() {
        if (!isAvailable()) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_AVAILABLE
            );
        }

        this.status = PerformanceSeatStatus.BLOCKED;
        clearHold();
    }

    private void unblock() {
        if (!isBlocked()) {
            throw new PerformanceException(
                    PerformanceErrorCode.INVALID_ADMIN_SEAT_STATUS
            );
        }

        this.status = PerformanceSeatStatus.AVAILABLE;
        clearHold();
    }

    private void validateAdministrativelyEditable() {
        if (isHeld()) {
            throw new PerformanceException(
                    PerformanceErrorCode.HELD_SEAT_CANNOT_BE_UPDATED
            );
        }

        if (isReserved()) {
            throw new PerformanceException(
                    PerformanceErrorCode.RESERVED_SEAT_CANNOT_BE_UPDATED
            );
        }
    }

    private static SeatGrade requireGrade(
            SeatGrade grade
    ) {
        if (grade == null) {
            throw new PerformanceException(
                    PerformanceErrorCode.PERFORMANCE_SEAT_GRADE_REQUIRED
            );
        }

        return grade;
    }

    private static Long requirePrice(Long price) {
        if (price == null || price < 0) {
            throw new PerformanceException(
                    PerformanceErrorCode.INVALID_PERFORMANCE_SEAT_PRICE
            );
        }

        return price;
    }

    private void clearHold() {
        this.heldBy = null;
        this.heldUntil = null;
    }
}
