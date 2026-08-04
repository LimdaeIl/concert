package com.concert.backend.venuehall.domain;

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

}
