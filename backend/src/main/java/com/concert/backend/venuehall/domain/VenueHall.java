package com.concert.backend.venuehall.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.venuehall.exception.SeatErrorCode;
import com.concert.backend.venuehall.exception.SeatException;
import com.concert.backend.venuehall.exception.VenueHallErrorCode;
import com.concert.backend.venuehall.exception.VenueHallException;
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
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_venue_halls",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_venue_halls_venue_name",
                columnNames = {"venue_id", "name"}
        ),
        indexes = @Index(
                name = "idx_v1_venue_halls_venue_status",
                columnList = "venue_id,status"
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VenueHall extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String floor;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VenueHallStatus status;

    @OneToMany(
            mappedBy = "venueHall",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private final List<Seat> seats = new ArrayList<>();

    private VenueHall(
            Long venueId,
            String name,
            String floor,
            Integer capacity
    ) {
        this.venueId = requireVenueId(venueId);
        this.name = requireName(name);
        this.floor = normalizeFloor(floor);
        this.capacity = requireCapacity(capacity);
        this.status = VenueHallStatus.ACTIVE;
    }

    public static VenueHall create(
            Long venueId,
            String name,
            String floor,
            Integer capacity
    ) {
        return new VenueHall(
                venueId,
                name,
                floor,
                capacity
        );
    }

    public void update(
            String name,
            String floor,
            Integer capacity
    ) {
        this.name = requireName(name);
        this.floor = normalizeFloor(floor);
        this.capacity = requireCapacity(capacity);
    }

    public void changeStatus(
            VenueHallStatus newStatus
    ) {
        if (newStatus == null) {
            throw new VenueHallException(
                    VenueHallErrorCode.VENUE_HALL_STATUS_REQUIRED
            );
        }

        if (status == newStatus) {
            throw new VenueHallException(
                    VenueHallErrorCode.SAME_VENUE_HALL_STATUS
            );
        }

        this.status = newStatus;
    }

    public boolean isActive() {
        return status == VenueHallStatus.ACTIVE;
    }

    public void addSeat(Seat seat) {
        if (seat == null) {
            throw new SeatException(
                    SeatErrorCode.SEAT_NOT_FOUND
            );
        }

        if (seats.size() >= capacity) {
            throw new SeatException(
                    SeatErrorCode.VENUE_HALL_CAPACITY_EXCEEDED
            );
        }

        seats.add(seat);
    }

    private static Long requireVenueId(Long venueId) {
        if (venueId == null || venueId <= 0) {
            throw new VenueHallException(
                    VenueHallErrorCode.VENUE_HALL_NOT_FOUND
            );
        }

        return venueId;
    }

    private static String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new VenueHallException(
                    VenueHallErrorCode.VENUE_HALL_NAME_REQUIRED
            );
        }

        return name.trim();
    }

    private static Integer requireCapacity(
            Integer capacity
    ) {
        if (capacity == null) {
            throw new VenueHallException(
                    VenueHallErrorCode.VENUE_HALL_CAPACITY_REQUIRED
            );
        }

        if (capacity <= 0) {
            throw new VenueHallException(
                    VenueHallErrorCode.INVALID_VENUE_HALL_CAPACITY
            );
        }

        return capacity;
    }

    private static String normalizeFloor(String floor) {
        if (floor == null || floor.isBlank()) {
            return null;
        }

        return floor.trim();
    }
}
