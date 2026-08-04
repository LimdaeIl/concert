package com.concert.backend.member.infrastructure.jpa;

import com.concert.backend.member.domain.MemberSocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaMemberSocialAccountRepository extends JpaRepository<MemberSocialAccount, Long> {

}
