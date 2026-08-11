package com.concert.backend.concert.application;

import com.concert.backend.common.storage.s3.S3PresignedUploadService;
import com.concert.backend.concert.application.result.PopularConcertResult;
import com.concert.backend.concert.query.PopularConcertQueryMapper;
import com.concert.backend.concert.query.PopularConcertQueryRow;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetPopularConcertsService {

    private static final int POPULAR_CONCERT_LIMIT = 10;

    private final PopularConcertQueryMapper popularConcertQueryMapper;

    private final S3PresignedUploadService s3PresignedUploadService;

    /*
     * 인기 공연 최종 조회 결과를 Redis에 캐시한다.
     *
     * Cache MISS:
     *
     * MySQL 집계
     *      ↓
     * S3 Presigned GET URL 생성
     *      ↓
     * Redis 저장
     *      ↓
     * 반환
     *
     * Cache HIT:
     *
     * Redis
     *      ↓
     * 최종 PopularConcertResult 반환
     *
     * Redis TTL은 반드시
     * S3 Presigned GET URL 만료시간보다 짧게 유지한다.
     */
    @Cacheable(
            cacheNames = "popularConcerts",
            key = "'top10'",
            sync = true
    )
    @Transactional(readOnly = true)
    public List<PopularConcertResult> getPopularConcerts() {

        List<PopularConcertQueryRow> rows =
                popularConcertQueryMapper.findPopularConcerts(
                        POPULAR_CONCERT_LIMIT
                );

        List<PopularConcertResult> results =
                new ArrayList<>(
                        rows.size()
                );

        for (int i = 0; i < rows.size(); i++) {

            PopularConcertQueryRow row =
                    rows.get(i);

            String posterUrl =
                    s3PresignedUploadService.createReadUrl(
                            row.posterUrl()
                    );

            results.add(
                    PopularConcertResult.from(
                            row,
                            posterUrl,
                            i + 1
                    )
            );
        }

        return results;
    }
}
