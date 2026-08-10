package com.concert.backend.concert.application.assembler;

import com.concert.backend.common.storage.s3.S3PresignedUploadService;
import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.domain.Concert;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ConcertResultAssembler {

    private final S3PresignedUploadService
            s3PresignedUploadService;

    public ConcertResult toResult(
            Concert concert
    ) {
        String posterUrl =
                s3PresignedUploadService
                        .createReadUrl(
                                concert.getPosterUrl()
                        );

        return ConcertResult.from(
                concert,
                posterUrl
        );
    }
}
