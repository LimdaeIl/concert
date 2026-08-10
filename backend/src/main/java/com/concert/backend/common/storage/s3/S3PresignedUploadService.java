package com.concert.backend.common.storage.s3;

import com.concert.backend.common.storage.ImageType;
import com.concert.backend.common.storage.result.PresignedUploadResult;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@RequiredArgsConstructor
@Service
public class S3PresignedUploadService {

    private static final String JPEG =
            "image/jpeg";

    private static final String PNG =
            "image/png";

    private static final String WEBP =
            "image/webp";

    private final S3Presigner s3Presigner;
    private final S3Properties properties;

    public String createReadUrl(
            String objectKey
    ) {
        if (objectKey == null
                || objectKey.isBlank()) {
            return null;
        }

        GetObjectRequest getObjectRequest =
                GetObjectRequest.builder()
                        .bucket(
                                properties.bucket()
                        )
                        .key(
                                objectKey
                        )
                        .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(
                                properties.readUrlExpiration()
                        )
                        .getObjectRequest(
                                getObjectRequest
                        )
                        .build();

        return s3Presigner
                .presignGetObject(
                        presignRequest
                )
                .url()
                .toString();
    }

    public PresignedUploadResult createUploadUrl(
            ImageType imageType,
            Long ownerId,
            String contentType
    ) {
        validateOwnerId(
                ownerId
        );

        String normalizedContentType =
                normalizeContentType(
                        contentType
                );

        String extension =
                resolveExtension(
                        normalizedContentType
                );

        String objectKey =
                createObjectKey(
                        imageType,
                        ownerId,
                        extension
                );

        Duration expiration =
                properties.uploadUrlExpiration();

        PutObjectRequest putObjectRequest =
                PutObjectRequest.builder()
                        .bucket(
                                properties.bucket()
                        )
                        .key(
                                objectKey
                        )
                        .contentType(
                                normalizedContentType
                        )
                        .build();

        PutObjectPresignRequest presignRequest =
                PutObjectPresignRequest.builder()
                        .signatureDuration(
                                expiration
                        )
                        .putObjectRequest(
                                putObjectRequest
                        )
                        .build();

        PresignedPutObjectRequest presignedRequest =
                s3Presigner.presignPutObject(
                        presignRequest
                );

        return new PresignedUploadResult(
                objectKey,
                presignedRequest.url().toString(),
                Instant.now()
                        .plus(expiration)
        );
    }

    private String createObjectKey(
            ImageType imageType,
            Long ownerId,
            String extension
    ) {
        String uuid =
                UUID.randomUUID()
                        .toString();

        return switch (imageType) {

            case MEMBER_PROFILE ->
                    "members/"
                            + ownerId
                            + "/profile/"
                            + uuid
                            + "."
                            + extension;

            case CONCERT_POSTER ->
                    "concerts/"
                            + ownerId
                            + "/poster/"
                            + uuid
                            + "."
                            + extension;
        };
    }

    private String normalizeContentType(
            String contentType
    ) {
        if (contentType == null
                || contentType.isBlank()) {
            throw new IllegalArgumentException(
                    "이미지 Content-Type이 필요합니다."
            );
        }

        String normalized =
                contentType.trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        if (!normalized.equals(JPEG)
                && !normalized.equals(PNG)
                && !normalized.equals(WEBP)) {

            throw new IllegalArgumentException(
                    "지원하지 않는 이미지 형식입니다."
            );
        }

        return normalized;
    }

    private String resolveExtension(
            String contentType
    ) {
        return switch (contentType) {

            case JPEG ->
                    "jpg";

            case PNG ->
                    "png";

            case WEBP ->
                    "webp";

            default ->
                    throw new IllegalArgumentException(
                            "지원하지 않는 이미지 형식입니다."
                    );
        };
    }

    private void validateOwnerId(
            Long ownerId
    ) {
        if (ownerId == null
                || ownerId <= 0) {

            throw new IllegalArgumentException(
                    "올바른 리소스 ID가 필요합니다."
            );
        }
    }
}
