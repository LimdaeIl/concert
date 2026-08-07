package com.concert.backend.concert.domain;

import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_concerts",
        indexes = {
                @Index(
                        name = "idx_v1_concerts_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_v1_concerts_category_status",
                        columnList = "category,status"
                )
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

    private Concert(
            String title,
            String subtitle,
            String description,
            ConcertCategory category,
            Integer runningTime,
            AgeRating ageRating,
            String posterUrl
    ) {
        this.title = requireTitle(title);
        this.subtitle = normalizeText(subtitle);
        this.description = normalizeText(description);
        this.category = requireCategory(category);
        this.runningTime = validateRunningTime(runningTime);
        this.ageRating = requireAgeRating(ageRating);
        this.posterUrl = normalizeText(posterUrl);
        this.status = ConcertStatus.DRAFT;
    }

    public static Concert create(
            String title,
            String subtitle,
            String description,
            ConcertCategory category,
            Integer runningTime,
            AgeRating ageRating,
            String posterUrl
    ) {
        return new Concert(
                title,
                subtitle,
                description,
                category,
                runningTime,
                ageRating,
                posterUrl
        );
    }

    public void update(
            String title,
            String subtitle,
            String description,
            ConcertCategory category,
            Integer runningTime,
            AgeRating ageRating,
            String posterUrl
    ) {
        validateEditable();

        this.title = requireTitle(title);
        this.subtitle = normalizeText(subtitle);
        this.description = normalizeText(description);
        this.category = requireCategory(category);
        this.runningTime = validateRunningTime(runningTime);
        this.ageRating = requireAgeRating(ageRating);
        this.posterUrl = normalizeText(posterUrl);
    }

    public void changeStatus(ConcertStatus newStatus) {
        if (newStatus == null) {
            throw new ConcertException(
                    ConcertErrorCode.CONCERT_STATUS_REQUIRED
            );
        }

        if (status == newStatus) {
            throw new ConcertException(
                    ConcertErrorCode.SAME_CONCERT_STATUS
            );
        }

        if (!canChangeStatusTo(newStatus)) {
            throw new ConcertException(
                    ConcertErrorCode.INVALID_CONCERT_STATUS_TRANSITION
            );
        }

        this.status = newStatus;
    }

    public boolean isPublished() {
        return status == ConcertStatus.PUBLISHED;
    }

    private boolean canChangeStatusTo(
            ConcertStatus newStatus
    ) {
        return switch (status) {
            case DRAFT ->
                    newStatus == ConcertStatus.PUBLISHED
                            || newStatus == ConcertStatus.CANCELLED;

            case PUBLISHED ->
                    newStatus == ConcertStatus.CLOSED
                            || newStatus == ConcertStatus.CANCELLED;

            case CLOSED, CANCELLED -> false;
        };
    }

    private void validateEditable() {
        if (status == ConcertStatus.CLOSED
                || status == ConcertStatus.CANCELLED) {
            throw new ConcertException(
                    ConcertErrorCode.CONCERT_NOT_EDITABLE
            );
        }
    }

    private static String requireTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new ConcertException(
                    ConcertErrorCode.CONCERT_TITLE_REQUIRED
            );
        }

        return title.trim();
    }

    private static ConcertCategory requireCategory(
            ConcertCategory category
    ) {
        if (category == null) {
            throw new ConcertException(
                    ConcertErrorCode.CONCERT_CATEGORY_REQUIRED
            );
        }

        return category;
    }

    private static AgeRating requireAgeRating(
            AgeRating ageRating
    ) {
        if (ageRating == null) {
            throw new ConcertException(
                    ConcertErrorCode.CONCERT_AGE_RATING_REQUIRED
            );
        }

        return ageRating;
    }

    private static Integer validateRunningTime(
            Integer runningTime
    ) {
        if (runningTime != null && runningTime <= 0) {
            throw new ConcertException(
                    ConcertErrorCode.INVALID_RUNNING_TIME
            );
        }

        return runningTime;
    }

    private static String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
