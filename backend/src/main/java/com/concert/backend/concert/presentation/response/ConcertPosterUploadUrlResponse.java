package com.concert.backend.concert.presentation.response;

import com.concert.backend.common.storage.result.PresignedUploadResult;
import java.time.Instant;

public record ConcertPosterUploadUrlResponse(
        String objectKey,
        String uploadUrl,
        Instant expiresAt
) {

    public static ConcertPosterUploadUrlResponse from(
            PresignedUploadResult result
    ) {
        return new ConcertPosterUploadUrlResponse(
                result.objectKey(),
                result.uploadUrl(),
                result.expiresAt()
        );
    }
}
