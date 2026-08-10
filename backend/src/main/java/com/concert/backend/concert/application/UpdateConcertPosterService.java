package com.concert.backend.concert.application;

import com.concert.backend.common.storage.event.S3ObjectDeleteEvent;
import com.concert.backend.common.storage.s3.S3ObjectService;
import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdateConcertPosterService {

    private final ConcertRepository
            concertRepository;

    private final S3ObjectService
            s3ObjectService;

    private final ApplicationEventPublisher
            eventPublisher;

    @Transactional
    public void update(
            Long concertId,
            String objectKey
    ) {
        Concert concert =
                concertRepository
                        .findById(
                                concertId
                        )
                        .orElseThrow(
                                () ->
                                        new ConcertException(
                                                ConcertErrorCode.CONCERT_NOT_FOUND
                                        )
                        );

        validateObjectKey(
                concertId,
                objectKey
        );

        /*
         * Presigned URL만 발급받고
         * 실제 PUT을 수행하지 않은 Key를
         * DB에 저장하지 못하도록 확인한다.
         */
        if (!s3ObjectService.exists(
                objectKey
        )) {
            throw new ConcertException(
                    ConcertErrorCode.CONCERT_POSTER_NOT_FOUND
            );
        }

        String previousObjectKey =
                concert.getPosterUrl();

        if (objectKey.equals(
                previousObjectKey
        )) {
            return;
        }

        concert.updatePoster(
                objectKey
        );

        /*
         * 기존 포스터가 있다면
         * DB commit 성공 후 삭제한다.
         */
        if (previousObjectKey != null
                && !previousObjectKey.isBlank()) {

            eventPublisher.publishEvent(
                    new S3ObjectDeleteEvent(
                            previousObjectKey
                    )
            );
        }
    }

    private void validateObjectKey(
            Long concertId,
            String objectKey
    ) {
        if (objectKey == null
                || objectKey.isBlank()) {

            throw new ConcertException(
                    ConcertErrorCode.CONCERT_POSTER_KEY_REQUIRED
            );
        }

        String requiredPrefix =
                "concerts/"
                        + concertId
                        + "/poster/";

        if (!objectKey.startsWith(
                requiredPrefix
        )) {
            throw new ConcertException(
                    ConcertErrorCode.INVALID_CONCERT_POSTER_KEY
            );
        }
    }
}
