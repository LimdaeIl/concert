package com.concert.backend.concert.application;

import com.concert.backend.common.storage.ImageType;
import com.concert.backend.common.storage.result.PresignedUploadResult;
import com.concert.backend.common.storage.s3.S3PresignedUploadService;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CreateConcertPosterUploadUrlService {

    private final ConcertRepository
            concertRepository;

    private final S3PresignedUploadService
            s3PresignedUploadService;

    @Transactional(readOnly = true)
    public PresignedUploadResult create(
            Long concertId,
            String contentType
    ) {
        /*
         * 존재하지 않는 concertId를 이용해
         * 임의의 S3 prefix를 만들지 못하도록
         * 공연 존재 여부부터 확인한다.
         */
        if (!concertRepository.existsById(
                concertId
        )) {
            throw new ConcertException(
                    ConcertErrorCode.CONCERT_NOT_FOUND
            );
        }

        return s3PresignedUploadService
                .createUploadUrl(
                        ImageType.CONCERT_POSTER,
                        concertId,
                        contentType
                );
    }
}
