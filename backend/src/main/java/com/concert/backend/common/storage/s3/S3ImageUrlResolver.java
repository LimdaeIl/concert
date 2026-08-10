package com.concert.backend.common.storage.s3;

import com.concert.backend.common.storage.ImageUrlResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class S3ImageUrlResolver
        implements ImageUrlResolver {

    private final S3Properties properties;

    @Override
    public String resolve(
            String objectKey
    ) {
        if (objectKey == null
                || objectKey.isBlank()) {
            return null;
        }

        return "https://"
                + properties.bucket()
                + ".s3."
                + properties.region()
                + ".amazonaws.com/"
                + objectKey;
    }
}
