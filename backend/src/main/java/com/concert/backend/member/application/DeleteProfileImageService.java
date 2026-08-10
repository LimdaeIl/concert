package com.concert.backend.member.application;

import com.concert.backend.common.storage.event.S3ObjectDeleteEvent;
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
public class DeleteProfileImageService {

    private final MemberRepository memberRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void delete(
            Long memberId
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

        String objectKey =
                member.getProfileImageKey();

        if (objectKey == null
                || objectKey.isBlank()) {
            return;
        }

        member.removeProfileImage();

        eventPublisher.publishEvent(
                new S3ObjectDeleteEvent(
                        objectKey
                )
        );
    }
}
