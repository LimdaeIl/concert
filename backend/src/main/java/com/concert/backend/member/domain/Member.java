package com.concert.backend.member.domain;

import com.concert.backend.common.domain.Address;
import com.concert.backend.common.domain.BaseAuditEntity;
import com.concert.backend.common.domain.BaseTimeEntity;
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
        uniqueConstraints = @UniqueConstraint(
                name = "uk_v1_members_email",
                columnNames = "email"
        )
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
}
