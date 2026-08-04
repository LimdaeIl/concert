package com.concert.backend.venuehall.domain;

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
}
