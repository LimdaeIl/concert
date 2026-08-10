package com.concert.backend.common.storage.result;

import java.time.Instant;

public record PresignedUploadResult(
        String objectKey,
        String uploadUrl,
        Instant expiresAt
) {
}
