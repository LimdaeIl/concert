package com.concert.backend.venue.domain;

import com.concert.backend.common.domain.Address;
import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.venue.exception.VenueErrorCode;
import com.concert.backend.venue.exception.VenueException;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_venues",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_venues_name_address",
                columnNames = {"name", "road_address"}
        ),
        indexes = @Index(
                name = "idx_v1_venues_status",
                columnList = "status"
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Venue extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VenueStatus status;

    @Embedded
    private Address address;

    private Venue(
            String name,
            String phone,
            Address address
    ) {
        this.name = requireName(name);
        this.phone = requirePhone(phone);
        this.status = VenueStatus.ACTIVE;
        this.address = requireAddress(address);
    }

    public static Venue create(
            String name,
            String phone,
            Address address
    ) {
        return new Venue(
                name,
                phone,
                address
        );
    }

    public void update(
            String name,
            String phone,
            Address address
    ) {
        this.name = requireName(name);
        this.phone = requirePhone(phone);
        this.address = requireAddress(address);
    }

    public void changeStatus(VenueStatus newStatus) {
        if (newStatus == null) {
            throw new VenueException(
                    VenueErrorCode.VENUE_STATUS_REQUIRED
            );
        }

        if (status == newStatus) {
            throw new VenueException(
                    VenueErrorCode.SAME_VENUE_STATUS
            );
        }

        this.status = newStatus;
    }

    public boolean isActive() {
        return status == VenueStatus.ACTIVE;
    }

    private static String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new VenueException(
                    VenueErrorCode.VENUE_NAME_REQUIRED
            );
        }

        return name.trim();
    }

    private static String requirePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new VenueException(
                    VenueErrorCode.VENUE_PHONE_REQUIRED
            );
        }

        return phone.trim();
    }

    private static Address requireAddress(Address address) {
        if (address == null) {
            throw new VenueException(
                    VenueErrorCode.VENUE_ADDRESS_REQUIRED
            );
        }

        return address;
    }
}