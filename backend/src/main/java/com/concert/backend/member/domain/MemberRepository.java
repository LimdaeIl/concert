package com.concert.backend.member.domain;

public interface MemberRepository {

    Member save(Member member);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
