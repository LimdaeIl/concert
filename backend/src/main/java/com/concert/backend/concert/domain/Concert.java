package com.concert.backend.concert.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Objects;

@Entity
@Table(
        name = "v1_concerts",
        indexes = {
                @Index(name = "idx_v1_concerts_status", columnList = "status"),
                @Index(name = "idx_v1_concerts_category_status", columnList = "category,status")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Concert extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 200)
    private String subtitle;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConcertCategory category;

    @Column(name = "running_time")
    private Integer runningTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_rating", nullable = false, length = 20)
    private AgeRating ageRating;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConcertStatus status;

}
