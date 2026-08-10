package com.concert.backend.common.storage.event;

public record S3ObjectDeleteEvent(
        String objectKey
) {
}

