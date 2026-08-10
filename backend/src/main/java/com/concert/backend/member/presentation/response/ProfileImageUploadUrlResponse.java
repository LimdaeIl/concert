package com.concert.backend.member.presentation.response;

import com.concert.backend.common.storage.result.PresignedUploadResult;
import java.time.Instant;

public record ProfileImageUploadUrlResponse(
        String objectKey,
        String uploadUrl,
        Instant expiresAt
) {

    public static ProfileImageUploadUrlResponse from(
            PresignedUploadResult result
    ) {
        return new ProfileImageUploadUrlResponse(
                result.objectKey(),
                result.uploadUrl(),
                result.expiresAt()
        );
    }
}
