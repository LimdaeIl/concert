package com.concert.backend.reservation.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.SeatGrade;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_reservation_seats",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_reservation_seats_reservation_seat",
                columnNames = {
                        "reservation_id",
                        "performance_seat_id"
                }
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReservationSeat extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "reservation_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_v1_reservation_seats_reservation"
            )
    )
    private Reservation reservation;

    @Column(
            name = "performance_seat_id",
            nullable = false
    )
    private Long performanceSeatId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatGrade grade;

    @Column(nullable = false)
    private Long price;

    private ReservationSeat(
            Reservation reservation,
            PerformanceSeat performanceSeat
    ) {
        if (reservation == null) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_NOT_FOUND
            );
        }

        if (performanceSeat == null) {
            throw new ReservationException(
                    ReservationErrorCode.RESERVATION_SEAT_REQUIRED
            );
        }

        this.reservation = reservation;
        this.performanceSeatId =
                performanceSeat.getId();
        this.grade = performanceSeat.getGrade();
        this.price = performanceSeat.getPrice();
    }

    public static ReservationSeat create(
            Reservation reservation,
            PerformanceSeat performanceSeat
    ) {
        return new ReservationSeat(
                reservation,
                performanceSeat
        );
    }
}
