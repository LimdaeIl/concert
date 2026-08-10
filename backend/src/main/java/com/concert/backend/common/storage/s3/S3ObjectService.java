package com.concert.backend.common.storage.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@RequiredArgsConstructor
@Service
public class S3ObjectService {

    private final S3Client s3Client;
    private final S3Properties properties;

    public boolean exists(
            String objectKey
    ) {
        if (objectKey == null
                || objectKey.isBlank()) {
            return false;
        }

        try {
            s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(
                                    properties.bucket()
                            )
                            .key(
                                    objectKey
                            )
                            .build()
            );

            return true;

        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                return false;
            }

            throw exception;
        }
    }

    public void delete(
            String objectKey
    ) {
        if (objectKey == null
                || objectKey.isBlank()) {
            return;
        }

        s3Client.deleteObject(
                DeleteObjectRequest.builder()
                        .bucket(
                                properties.bucket()
                        )
                        .key(
                                objectKey
                        )
                        .build()
        );
    }
}
