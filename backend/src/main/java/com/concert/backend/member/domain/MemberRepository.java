package com.concert.backend.member.domain;

import java.util.Optional;

public interface MemberRepository {

    Member save(Member member);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<Member> findById(Long memberId);

    Optional<Member> findByEmail(String email);
}
