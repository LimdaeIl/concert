package com.concert.backend.member.domain;

import com.concert.backend.common.domain.Address;
import com.concert.backend.common.domain.BaseTimeEntity;
import com.concert.backend.member.exception.MemberErrorCode;
import com.concert.backend.member.exception.MemberException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "v1_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_v1_members_email",
                        columnNames = "email"
                ),
                @UniqueConstraint(
                        name = "uk_v1_members_phone",
                        columnNames = "phone"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 11)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberStatus status;

    @Embedded
    private Address address;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    @OneToMany(
            mappedBy = "member",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private final List<MemberSocialAccount> socialAccounts = new ArrayList<>();

    private Member(String email, String password, String name, String phone, Address address) {
        this.email = Objects.requireNonNull(email);
        this.password = password;
        this.name = Objects.requireNonNull(name);
        this.phone = Objects.requireNonNull(phone);
        this.role = MemberRole.MEMBER;
        this.status = MemberStatus.ACTIVE;
        this.address = Objects.requireNonNull(address);
    }

    public static Member createLocal(
            String email,
            String encodedPassword,
            String name,
            String phone,
            Address address
    ) {
        return new Member(email, Objects.requireNonNull(encodedPassword), name, phone, address);
    }

    public static Member createSocial(
            String email,
            String name,
            String phone,
            Address address
    ) {
        return new Member(email, null, name, phone, address);
    }

    public void addSocialAccount(
            SocialProvider provider,
            String providerUserId,
            String providerEmail,
            LocalDateTime connectedAt
    ) {
        MemberSocialAccount socialAccount = MemberSocialAccount.create(
                this,
                Objects.requireNonNull(provider),
                Objects.requireNonNull(providerUserId),
                providerEmail,
                connectedAt
        );

        socialAccounts.add(socialAccount);
    }

    public boolean isSignInAllowed() {
        return status == MemberStatus.ACTIVE;
    }

    public void withdraw(LocalDateTime withdrawnAt) {
        if (status == MemberStatus.WITHDRAWN) {
            throw new MemberException(
                    MemberErrorCode.ALREADY_WITHDRAWN_MEMBER
            );
        }

        if (id == null) {
            throw new IllegalStateException(
                    "저장되지 않은 회원은 탈퇴할 수 없습니다."
            );
        }

        this.status = MemberStatus.WITHDRAWN;
        this.withdrawnAt = Objects.requireNonNull(withdrawnAt);

        /*
         * email과 phone에는 unique constraint가 있으므로
         * 회원별로 서로 다른 익명 값을 생성한다.
         */
        this.email = createWithdrawnEmail(id);
        this.phone = createWithdrawnPhone(id);
        this.name = "탈퇴회원";

        /*
         * 로컬 회원 비밀번호도 더 이상 의미가 없도록 제거한다.
         * password 컬럼은 nullable이므로 null 사용 가능하다.
         */
        this.password = null;

        this.address = Address.anonymized();

        /*
         * orphanRemoval=true이므로 transaction commit 시
         * v1_member_social_accounts 행이 삭제된다.
         */
        this.socialAccounts.clear();
    }

    public boolean isWithdrawn() {
        return status == MemberStatus.WITHDRAWN;
    }

    private String createWithdrawnEmail(Long memberId) {
        return "withdrawn_" + memberId + "@deleted.local";
    }

    private String createWithdrawnPhone(Long memberId) {
        /*
         * phone 컬럼 길이는 11이다.
         * 9 + 10자리 zero-padding 형식으로 회원별 고유값을 만든다.
         */
        if (memberId > 9_999_999_999L) {
            throw new IllegalStateException(
                    "탈퇴 회원 전화번호 익명화 범위를 초과했습니다."
            );
        }

        return "9" + String.format("%010d", memberId);
    }

    public void updateProfile(String name, Address address) {
        if (status != MemberStatus.ACTIVE) {
            throw new MemberException(MemberErrorCode.MEMBER_NOT_ACTIVE);
        }

        if (name == null || name.isBlank()) {
            throw new MemberException(MemberErrorCode.NAME_REQUIRED);
        }

        boolean nameChanged = !this.name.equals(name);
        boolean addressChanged = !Objects.equals(this.address, address);

        if (!nameChanged && !addressChanged) {
            throw new MemberException(MemberErrorCode.NO_PROFILE_CHANGES);
        }

        this.name = name;
        this.address = Objects.requireNonNull(address);
    }

    public boolean hasPassword() {
        return password != null && !password.isBlank();
    }

    public void changePassword(String encodedPassword) {
        if (!isSignInAllowed()) {
            throw new MemberException(MemberErrorCode.MEMBER_NOT_ACTIVE);
        }

        if (!hasPassword()) {
            throw new MemberException(MemberErrorCode.PASSWORD_CHANGE_NOT_AVAILABLE);
        }

        this.password = Objects.requireNonNull(encodedPassword);
    }

}

