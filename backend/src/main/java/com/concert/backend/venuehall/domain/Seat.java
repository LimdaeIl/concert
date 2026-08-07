package com.concert.backend.venuehall.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.venuehall.exception.SeatErrorCode;
import com.concert.backend.venuehall.exception.SeatException;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_seats",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_seats_position",
                columnNames = {
                        "venue_hall_id",
                        "section_name",
                        "floor",
                        "row_name",
                        "seat_number"
                }
        ),
        indexes = @Index(
                name = "idx_v1_seats_venue_hall_status",
                columnList = "venue_hall_id,status"
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Seat extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "venue_hall_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_v1_seats_venue_hall")
    )
    private VenueHall venueHall;

    @Column(name = "section_name", nullable = false, length = 50)
    private String sectionName;

    @Column(nullable = false)
    private Short floor;

    @Column(name = "row_name", nullable = false, length = 20)
    private String rowName;

    @Column(name = "seat_number", nullable = false, length = 20)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false, length = 30)
    private SeatType seatType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatStatus status;

    private Seat(
            VenueHall venueHall,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            SeatType seatType
    ) {
        this.venueHall = requireVenueHall(venueHall);
        this.sectionName = requireSectionName(sectionName);
        this.floor = requireFloor(floor);
        this.rowName = requireRowName(rowName);
        this.seatNumber = requireSeatNumber(seatNumber);
        this.seatType = requireSeatType(seatType);
        this.status = SeatStatus.ACTIVE;
    }

    public static Seat create(
            VenueHall venueHall,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            SeatType seatType
    ) {
        return new Seat(
                venueHall,
                sectionName,
                floor,
                rowName,
                seatNumber,
                seatType
        );
    }

    public void update(
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            SeatType seatType
    ) {
        this.sectionName = requireSectionName(sectionName);
        this.floor = requireFloor(floor);
        this.rowName = requireRowName(rowName);
        this.seatNumber = requireSeatNumber(seatNumber);
        this.seatType = requireSeatType(seatType);
    }

    public void changeStatus(SeatStatus newStatus) {
        if (newStatus == null) {
            throw new SeatException(
                    SeatErrorCode.SEAT_STATUS_REQUIRED
            );
        }

        if (status == newStatus) {
            throw new SeatException(
                    SeatErrorCode.SAME_SEAT_STATUS
            );
        }

        this.status = newStatus;
    }

    public boolean isActive() {
        return status == SeatStatus.ACTIVE;
    }

    private static VenueHall requireVenueHall(
            VenueHall venueHall
    ) {
        if (venueHall == null) {
            throw new SeatException(
                    VenueHallErrorCode.VENUE_HALL_NOT_FOUND
            );
        }

        return venueHall;
    }

    private static String requireSectionName(
            String sectionName
    ) {
        if (sectionName == null || sectionName.isBlank()) {
            throw new SeatException(
                    SeatErrorCode.SEAT_SECTION_REQUIRED
            );
        }

        return sectionName.trim();
    }

    private static Short requireFloor(Short floor) {
        if (floor == null) {
            throw new SeatException(
                    SeatErrorCode.SEAT_FLOOR_REQUIRED
            );
        }

        if (floor <= 0) {
            throw new SeatException(
                    SeatErrorCode.INVALID_SEAT_FLOOR
            );
        }

        return floor;
    }

    private static String requireRowName(String rowName) {
        if (rowName == null || rowName.isBlank()) {
            throw new SeatException(
                    SeatErrorCode.SEAT_ROW_REQUIRED
            );
        }

        return rowName.trim();
    }

    private static String requireSeatNumber(
            String seatNumber
    ) {
        if (seatNumber == null || seatNumber.isBlank()) {
            throw new SeatException(
                    SeatErrorCode.SEAT_NUMBER_REQUIRED
            );
        }

        return seatNumber.trim();
    }

    private static SeatType requireSeatType(
            SeatType seatType
    ) {
        if (seatType == null) {
            throw new SeatException(
                    SeatErrorCode.SEAT_TYPE_REQUIRED
            );
        }

        return seatType;
    }
}
