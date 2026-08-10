package com.concert.backend.member.application;

import com.concert.backend.common.storage.event.S3ObjectDeleteEvent;
import com.concert.backend.common.storage.s3.S3ObjectService;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdateProfileImageService {

    private final MemberRepository memberRepository;
    private final S3ObjectService s3ObjectService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void update(
            Long memberId,
            String objectKey
    ) {
        Member member =
                memberRepository
                        .findById(memberId)
                        .orElseThrow(
                                () ->
                                        new MemberException(
                                                MemberErrorCode.MEMBER_NOT_FOUND
                                        )
                        );

        validateObjectKey(
                memberId,
                objectKey
        );

        if (!s3ObjectService.exists(
                objectKey
        )) {
            throw new MemberException(
                    MemberErrorCode.PROFILE_IMAGE_NOT_FOUND
            );
        }

        String previousObjectKey =
                member.getProfileImageKey();

        if (objectKey.equals(
                previousObjectKey
        )) {
            return;
        }

        member.updateProfileImage(
                objectKey
        );

        if (previousObjectKey != null
                && !previousObjectKey.isBlank()) {

            eventPublisher.publishEvent(
                    new S3ObjectDeleteEvent(
                            previousObjectKey
                    )
            );
        }
    }

    private void validateObjectKey(
            Long memberId,
            String objectKey
    ) {
        if (objectKey == null
                || objectKey.isBlank()) {

            throw new MemberException(
                    MemberErrorCode.PROFILE_IMAGE_KEY_REQUIRED
            );
        }

        String requiredPrefix =
                "members/"
                        + memberId
                        + "/profile/";

        if (!objectKey.startsWith(
                requiredPrefix
        )) {

            throw new MemberException(
                    MemberErrorCode.INVALID_PROFILE_IMAGE_KEY
            );
        }
    }
}
