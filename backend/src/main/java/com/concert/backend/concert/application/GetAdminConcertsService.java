package com.concert.backend.concert.application;

import com.concert.backend.common.storage.s3.S3PresignedUploadService;
import com.concert.backend.concert.application.result.AdminConcertPageResult;
import com.concert.backend.concert.application.result.AdminConcertResult;
import com.concert.backend.concert.domain.ConcertCategory;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.query.AdminConcertQueryMapper;
import com.concert.backend.concert.query.AdminConcertQueryRow;
import com.concert.backend.concert.query.AdminConcertSearchCondition;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetAdminConcertsService {

    private final AdminConcertQueryMapper
            adminConcertQueryMapper;

    private final S3PresignedUploadService
            s3PresignedUploadService;

    @Transactional(readOnly = true)
    public AdminConcertPageResult getConcerts(
            String keyword,
            ConcertCategory category,
            ConcertStatus status,
            int page,
            int size
    ) {
        String normalizedKeyword =
                normalizeKeyword(
                        keyword
                );

        long offset =
                (long) page * size;

        AdminConcertSearchCondition condition =
                new AdminConcertSearchCondition(
                        normalizedKeyword,
                        category,
                        status,
                        size,
                        offset
                );

        long totalElements =
                adminConcertQueryMapper.count(
                        condition
                );

        List<AdminConcertResult> concerts;

        if (totalElements == 0
                || offset >= totalElements) {

            concerts =
                    List.of();

        } else {
            List<AdminConcertQueryRow> rows =
                    adminConcertQueryMapper
                            .findAll(
                                    condition
                            );

            concerts =
                    rows.stream()
                            .map(
                                    this::toResult
                            )
                            .toList();
        }

        return AdminConcertPageResult.of(
                concerts,
                page,
                size,
                totalElements
        );
    }

    private AdminConcertResult toResult(
            AdminConcertQueryRow row
    ) {
        String posterUrl =
                s3PresignedUploadService
                        .createReadUrl(
                                row.posterUrl()
                        );

        return AdminConcertResult.from(
                row,
                posterUrl
        );
    }

    private String normalizeKeyword(
            String keyword
    ) {
        if (keyword == null) {
            return null;
        }

        String normalized =
                keyword.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}
