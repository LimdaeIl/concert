package com.concert.backend.member.application;

import com.concert.backend.common.storage.ImageType;
import com.concert.backend.common.storage.result.PresignedUploadResult;
import com.concert.backend.common.storage.s3.S3PresignedUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CreateProfileImageUploadUrlService {

    private final S3PresignedUploadService
            s3PresignedUploadService;

    @Transactional(readOnly = true)
    public PresignedUploadResult create(
            Long memberId,
            String contentType
    ) {
        return s3PresignedUploadService
                .createUploadUrl(
                        ImageType.MEMBER_PROFILE,
                        memberId,
                        contentType
                );
    }
}
