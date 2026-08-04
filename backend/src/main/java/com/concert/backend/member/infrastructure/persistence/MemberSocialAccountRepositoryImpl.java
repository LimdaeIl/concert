package com.concert.backend.member.infrastructure.persistence;

import com.concert.backend.member.domain.MemberSocialAccountRepository;
import com.concert.backend.member.infrastructure.jpa.JpaMemberSocialAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class MemberSocialAccountRepositoryImpl implements MemberSocialAccountRepository {

    private final JpaMemberSocialAccountRepository jpaRepository;

}
