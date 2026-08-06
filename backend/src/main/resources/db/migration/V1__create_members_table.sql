CREATE TABLE IF NOT EXISTS v1_members
(
    id             BIGINT         NOT NULL AUTO_INCREMENT COMMENT '회원 ID',
    email          VARCHAR(100)   NOT NULL COMMENT '이메일',
    password       VARCHAR(255)   NULL COMMENT '비밀번호',
    name           VARCHAR(50)    NOT NULL COMMENT '이름',
    phone          VARCHAR(11)    NOT NULL COMMENT '휴대전화 번호',
    role           VARCHAR(20)    NOT NULL DEFAULT 'MEMBER' COMMENT 'MEMBER, MANAGER, ADMIN',
    status         VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, SUSPENDED, WITHDRAWN',
    road_address   VARCHAR(255)   NOT NULL COMMENT '도로명 주소',
    jibun_address  VARCHAR(255)   NULL COMMENT '지번 주소',
    detail_address VARCHAR(255)   NULL COMMENT '상세 주소',
    zip_code       VARCHAR(10)    NULL COMMENT '우편번호',
    latitude       DECIMAL(10, 7) NULL COMMENT '위도',
    longitude      DECIMAL(10, 7) NULL COMMENT '경도',
    created_at     DATETIME(6)    NOT NULL COMMENT '생성일시',
    updated_at     DATETIME(6)    NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_members PRIMARY KEY (id),
    CONSTRAINT uk_v1_members_email UNIQUE (email)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '회원';


CREATE TABLE IF NOT EXISTS v1_member_social_accounts
(
    id               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '회원 소셜 계정 ID',
    member_id        BIGINT       NOT NULL COMMENT '회원 ID',
    provider         VARCHAR(20)  NOT NULL COMMENT 'GOOGLE, KAKAO, NAVER',
    provider_user_id VARCHAR(255) NOT NULL COMMENT '소셜 사용자 ID',
    provider_email   VARCHAR(255) NULL COMMENT '이메일',
    connected_at     DATETIME(6)  NOT NULL COMMENT '연결일시',
    last_login_at    DATETIME(6)  NULL COMMENT '최종 로그인 일시',
    created_by       BIGINT       NULL COMMENT '생성자 ID',
    created_at       DATETIME(6)  NOT NULL COMMENT '생성일시',
    updated_by       BIGINT       NULL COMMENT '수정자 ID',
    updated_at       DATETIME(6)  NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_member_social_accounts PRIMARY KEY (id),
    CONSTRAINT fk_v1_member_social_accounts_member FOREIGN KEY (member_id) REFERENCES v1_members (id),
    CONSTRAINT uk_v1_member_social_accounts_provider_user UNIQUE (provider, provider_user_id),
    CONSTRAINT uk_v1_member_social_accounts_member_provider UNIQUE (member_id, provider)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '회원 소셜 로그인 계정';


CREATE TABLE IF NOT EXISTS v1_venues
(
    id             BIGINT         NOT NULL AUTO_INCREMENT COMMENT '공연장 ID',
    name           VARCHAR(100)   NOT NULL COMMENT '공연장명',
    phone          VARCHAR(20)    NULL COMMENT '대표 전화번호',
    status         VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE',
    road_address   VARCHAR(255)   NOT NULL COMMENT '도로명 주소',
    jibun_address  VARCHAR(255)   NULL COMMENT '지번 주소',
    detail_address VARCHAR(255)   NULL COMMENT '상세 주소',
    zip_code       VARCHAR(10)    NULL COMMENT '우편번호',
    latitude       DECIMAL(10, 7) NOT NULL COMMENT '위도',
    longitude      DECIMAL(10, 7) NOT NULL COMMENT '경도',
    created_by     BIGINT         NULL COMMENT '생성자 ID',
    created_at     DATETIME(6)    NOT NULL COMMENT '생성일시',
    updated_by     BIGINT         NULL COMMENT '수정자 ID',
    updated_at     DATETIME(6)    NOT NULL COMMENT '수정일시',
    CONSTRAINT pk_v1_venues PRIMARY KEY (id),
    CONSTRAINT uk_v1_venues_name_address UNIQUE (name, road_address)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '공연장';


CREATE INDEX idx_v1_venues_status ON v1_venues (status);

CREATE TABLE IF NOT EXISTS v1_venue_halls
(
    id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '공연홀 ID',
    venue_id   BIGINT       NOT NULL COMMENT '공연장 ID',
    name       VARCHAR(100) NOT NULL COMMENT '공연홀명',
    floor      VARCHAR(20)  NULL COMMENT '위치 층',
    capacity   INT          NOT NULL COMMENT '수용 인원',
    status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, MAINTENANCE',
    created_by BIGINT       NULL COMMENT '생성자 ID',
    created_at DATETIME(6)  NOT NULL COMMENT '생성일시',
    updated_by BIGINT       NULL COMMENT '수정자 ID',
    updated_at DATETIME(6)  NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_venue_halls PRIMARY KEY (id),
    CONSTRAINT uk_v1_venue_halls_venue_name UNIQUE (venue_id, name),
    CONSTRAINT ck_v1_venue_halls_capacity CHECK (capacity > 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '공연홀';


CREATE TABLE IF NOT EXISTS v1_seats
(
    id            BIGINT      NOT NULL AUTO_INCREMENT COMMENT '좌석 ID',
    venue_hall_id BIGINT      NOT NULL COMMENT '공연홀 ID',
    section_name  VARCHAR(50) NOT NULL DEFAULT 'GENERAL' COMMENT '좌석 구역',

    floor         SMALLINT    NOT NULL DEFAULT 1 COMMENT '좌석 층',
    row_name      VARCHAR(20) NOT NULL COMMENT '좌석 열',
    seat_number   VARCHAR(20) NOT NULL COMMENT '좌석 번호',
    seat_type     VARCHAR(30) NOT NULL DEFAULT 'STANDARD' COMMENT 'STANDARD, WHEELCHAIR, COMPANION, OBSTRUCTED_VIEW',
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, MAINTENANCE',
    created_by    BIGINT      NULL COMMENT '생성자 ID',
    created_at    DATETIME(6) NOT NULL COMMENT '생성일시',
    updated_by    BIGINT      NULL COMMENT '수정자 ID',
    updated_at    DATETIME(6) NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_seats PRIMARY KEY (id),
    CONSTRAINT fk_v1_seats_venue_hall FOREIGN KEY (venue_hall_id) REFERENCES v1_venue_halls (id),
    CONSTRAINT uk_v1_seats_position UNIQUE (venue_hall_id, section_name, floor, row_name, seat_number),
    CONSTRAINT ck_v1_seats_floor CHECK (floor > 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '공연홀 좌석';


CREATE INDEX idx_v1_venue_halls_venue_status ON v1_venue_halls (venue_id, status);


CREATE INDEX idx_v1_seats_venue_hall_status ON v1_seats (venue_hall_id, status);

CREATE TABLE IF NOT EXISTS v1_concerts
(
    id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '공연 ID',
    title        VARCHAR(200) NOT NULL COMMENT '공연명',
    subtitle     VARCHAR(200) NULL COMMENT '부제',
    description  TEXT         NULL COMMENT '공연 설명',
    category     VARCHAR(30)  NOT NULL COMMENT 'CONCERT, MUSICAL, PLAY, CLASSIC, DANCE, ETC',
    running_time INT          NULL COMMENT '공연 시간(분)',
    age_rating   VARCHAR(20)  NOT NULL DEFAULT 'ALL' COMMENT 'ALL, AGE_7, AGE_12, AGE_15, AGE_19',
    poster_url   VARCHAR(500) NULL COMMENT '포스터 URL',
    status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT, PUBLISHED, CLOSED, CANCELLED',
    created_by   BIGINT       NULL COMMENT '생성자 ID',
    created_at   DATETIME(6)  NOT NULL COMMENT '생성일시',
    updated_by   BIGINT       NULL COMMENT '수정자 ID',
    updated_at   DATETIME(6)  NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_concerts PRIMARY KEY (id),

    CONSTRAINT ck_v1_concerts_running_time CHECK (running_time IS NULL OR running_time > 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '공연';


CREATE INDEX idx_v1_concerts_status ON v1_concerts (status);


CREATE INDEX idx_v1_concerts_category_status ON v1_concerts (category, status);

CREATE TABLE IF NOT EXISTS v1_performances
(
    id                     BIGINT      NOT NULL AUTO_INCREMENT COMMENT '공연 회차 ID',
    concert_id             BIGINT      NOT NULL COMMENT '공연 ID',
    venue_hall_id          BIGINT      NOT NULL COMMENT '공연홀 ID',
    starts_at              DATETIME(6) NOT NULL COMMENT '공연 시작일시',
    ends_at                DATETIME(6) NOT NULL COMMENT '공연 종료일시',
    reservation_opens_at   DATETIME(6) NOT NULL COMMENT '예매 시작일시',
    reservation_closes_at  DATETIME(6) NOT NULL COMMENT '예매 종료일시',
    max_tickets_per_member INT         NOT NULL DEFAULT 4 COMMENT '회원별 최대 예매 매수',
    status                 VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'SCHEDULED, OPEN, SOLD_OUT, COMPLETED, CANCELLED',
    created_by             BIGINT      NULL COMMENT '생성자 ID',
    created_at             DATETIME(6) NOT NULL COMMENT '생성일시',
    updated_by             BIGINT      NULL COMMENT '수정자 ID',
    updated_at             DATETIME(6) NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_performances PRIMARY KEY (id),
    CONSTRAINT uk_v1_performances_hall_starts_at UNIQUE (venue_hall_id, starts_at),
    CONSTRAINT ck_v1_performances_period CHECK (ends_at > starts_at),
    CONSTRAINT ck_v1_performances_reservation_period CHECK (reservation_closes_at > reservation_opens_at),
    CONSTRAINT ck_v1_performances_reservation_close CHECK (reservation_closes_at <= starts_at),
    CONSTRAINT ck_v1_performances_max_tickets CHECK (max_tickets_per_member > 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '공연 회차';


CREATE TABLE IF NOT EXISTS v1_performance_seats
(
    id             BIGINT      NOT NULL AUTO_INCREMENT COMMENT '공연 좌석 ID',
    performance_id BIGINT      NOT NULL COMMENT '공연 회차 ID',
    seat_id        BIGINT      NOT NULL COMMENT '좌석 ID',
    grade          VARCHAR(20) NOT NULL COMMENT 'VIP, R, S, A, B',
    price          BIGINT      NOT NULL COMMENT '판매 가격',
    status         VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' COMMENT 'AVAILABLE, HELD, RESERVED, BLOCKED',
    held_by        BIGINT      NULL COMMENT '선점 회원 ID',
    held_until     DATETIME(6) NULL COMMENT '선점 만료일시',
    version        BIGINT      NOT NULL DEFAULT 0 COMMENT '낙관적 락 버전',
    created_by     BIGINT      NULL COMMENT '생성자 ID',
    created_at     DATETIME(6) NOT NULL COMMENT '생성일시',
    updated_by     BIGINT      NULL COMMENT '수정자 ID',
    updated_at     DATETIME(6) NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_performance_seats PRIMARY KEY (id),
    CONSTRAINT fk_v1_performance_seats_performance FOREIGN KEY (performance_id) REFERENCES v1_performances (id),
    CONSTRAINT uk_v1_performance_seats_performance_seat UNIQUE (performance_id, seat_id),
    CONSTRAINT ck_v1_performance_seats_price CHECK (price >= 0),
    CONSTRAINT ck_v1_performance_seats_hold
        CHECK (
            (status = 'HELD' AND held_by IS NOT NULL AND held_until IS NOT NULL)
                OR
            (status <> 'HELD' AND held_by IS NULL AND held_until IS NULL)
            )
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '공연 회차별 좌석';


CREATE INDEX idx_v1_performances_concert_starts_at ON v1_performances (concert_id, starts_at);
CREATE INDEX idx_v1_performances_hall_starts_at ON v1_performances (venue_hall_id, starts_at);
CREATE INDEX idx_v1_performances_status_starts_at ON v1_performances (status, starts_at);
CREATE INDEX idx_v1_performance_seats_performance_status ON v1_performance_seats (performance_id, status);
CREATE INDEX idx_v1_performance_seats_performance_grade ON v1_performance_seats (performance_id, grade);
CREATE INDEX idx_v1_performance_seats_status_held_until ON v1_performance_seats (status, held_until);


CREATE TABLE IF NOT EXISTS v1_reservations
(
    id                 BIGINT      NOT NULL AUTO_INCREMENT COMMENT '예약 ID',
    reservation_number VARCHAR(30) NOT NULL COMMENT '예약 번호',
    member_id          BIGINT      NOT NULL COMMENT '회원 ID',
    performance_id     BIGINT      NOT NULL COMMENT '공연 회차 ID',
    total_amount       BIGINT      NOT NULL DEFAULT 0 COMMENT '총 결제 금액',
    status             VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT' COMMENT 'PENDING_PAYMENT, COMPLETED, CANCELLED, EXPIRED',
    expires_at         DATETIME(6) NOT NULL COMMENT '결제 만료일시',
    completed_at       DATETIME(6) NULL COMMENT '예약 완료일시',
    cancelled_at       DATETIME(6) NULL COMMENT '예약 취소일시',
    version            BIGINT      NOT NULL DEFAULT 0 COMMENT '낙관적 락 버전',
    created_by         BIGINT      NULL COMMENT '생성자 ID',
    created_at         DATETIME(6) NOT NULL COMMENT '생성일시',
    updated_by         BIGINT      NULL COMMENT '수정자 ID',
    updated_at         DATETIME(6) NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_reservations PRIMARY KEY (id),
    CONSTRAINT uk_v1_reservations_number UNIQUE (reservation_number),
    CONSTRAINT ck_v1_reservations_total_amount CHECK (total_amount >= 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '예약';


CREATE TABLE IF NOT EXISTS v1_reservation_seats
(
    id                  BIGINT      NOT NULL AUTO_INCREMENT COMMENT '예약 좌석 ID',
    reservation_id      BIGINT      NOT NULL COMMENT '예약 ID',
    performance_seat_id BIGINT      NOT NULL COMMENT '공연 좌석 ID',
    grade               VARCHAR(20) NOT NULL COMMENT '예약 당시 좌석 등급',
    price               BIGINT      NOT NULL COMMENT '예약 당시 좌석 가격',
    created_by          BIGINT      NULL COMMENT '생성자 ID',
    created_at          DATETIME(6) NOT NULL COMMENT '생성일시',
    updated_by          BIGINT      NULL COMMENT '수정자 ID',
    updated_at          DATETIME(6) NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_reservation_seats PRIMARY KEY (id),
    CONSTRAINT fk_v1_reservation_seats_reservation FOREIGN KEY (reservation_id) REFERENCES v1_reservations (id),
    CONSTRAINT uk_v1_reservation_seats_reservation_seat UNIQUE (reservation_id, performance_seat_id),
    CONSTRAINT ck_v1_reservation_seats_price CHECK (price >= 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '예약 좌석';


CREATE INDEX idx_v1_reservations_member_created_at ON v1_reservations (member_id, created_at);
CREATE INDEX idx_v1_reservations_member_status ON v1_reservations (member_id, status);
CREATE INDEX idx_v1_reservations_performance_status ON v1_reservations (performance_id, status);
CREATE INDEX idx_v1_reservations_status_expires_at ON v1_reservations (status, expires_at);
CREATE INDEX idx_v1_reservation_seats_performance_seat ON v1_reservation_seats (performance_seat_id);

CREATE TABLE IF NOT EXISTS v1_payments
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '결제 ID',
    payment_number      VARCHAR(30)  NOT NULL COMMENT '결제 번호',
    reservation_id      BIGINT       NOT NULL COMMENT '예약 ID',
    provider            VARCHAR(30)  NOT NULL COMMENT 'TOSS, KAKAO_PAY, NAVER_PAY, PORTONE',
    method              VARCHAR(30)  NOT NULL COMMENT 'CARD, TRANSFER, VIRTUAL_ACCOUNT, EASY_PAY',
    provider_payment_id VARCHAR(200) NULL COMMENT '결제사 거래 ID',
    amount              BIGINT       NOT NULL COMMENT '결제 금액',
    status              VARCHAR(30)  NOT NULL DEFAULT 'READY' COMMENT 'READY, IN_PROGRESS, PAID, FAILED, CANCELLED, PARTIAL_CANCELLED',
    failure_code        VARCHAR(100) NULL COMMENT '결제 실패 코드',
    failure_message     VARCHAR(500) NULL COMMENT '결제 실패 사유',
    requested_at        DATETIME(6)  NOT NULL COMMENT '결제 요청일시',
    approved_at         DATETIME(6)  NULL COMMENT '결제 승인일시',
    cancelled_at        DATETIME(6)  NULL COMMENT '결제 취소일시',
    version             BIGINT       NOT NULL DEFAULT 0 COMMENT '낙관적 락 버전',
    created_by          BIGINT       NULL COMMENT '생성자 ID',
    created_at          DATETIME(6)  NOT NULL COMMENT '생성일시',
    updated_by          BIGINT       NULL COMMENT '수정자 ID',
    updated_at          DATETIME(6)  NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_payments PRIMARY KEY (id),
    CONSTRAINT uk_v1_payments_number UNIQUE (payment_number),
    CONSTRAINT uk_v1_payments_provider_payment UNIQUE (provider, provider_payment_id),
    CONSTRAINT ck_v1_payments_amount CHECK (amount >= 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '결제';


CREATE TABLE IF NOT EXISTS v1_payment_cancellations
(
    id                       BIGINT       NOT NULL AUTO_INCREMENT COMMENT '결제 취소 ID',
    payment_id               BIGINT       NOT NULL COMMENT '결제 ID',
    cancellation_number      VARCHAR(30)  NOT NULL COMMENT '결제 취소 번호',
    amount                   BIGINT       NOT NULL COMMENT '취소 금액',
    reason                   VARCHAR(500) NOT NULL COMMENT '취소 사유',
    provider_cancellation_id VARCHAR(200) NULL COMMENT '결제사 취소 거래 ID',
    status                   VARCHAR(20)  NOT NULL DEFAULT 'REQUESTED' COMMENT 'REQUESTED, COMPLETED, FAILED',
    requested_at             DATETIME(6)  NOT NULL COMMENT '취소 요청일시',
    completed_at             DATETIME(6)  NULL COMMENT '취소 완료일시',
    created_by               BIGINT       NULL COMMENT '생성자 ID',
    created_at               DATETIME(6)  NOT NULL COMMENT '생성일시',
    updated_by               BIGINT       NULL COMMENT '수정자 ID',
    updated_at               DATETIME(6)  NOT NULL COMMENT '수정일시',

    CONSTRAINT pk_v1_payment_cancellations PRIMARY KEY (id),
    CONSTRAINT fk_v1_payment_cancellations_payment FOREIGN KEY (payment_id) REFERENCES v1_payments (id),
    CONSTRAINT uk_v1_payment_cancellations_number UNIQUE (cancellation_number),
    CONSTRAINT uk_v1_payment_cancellations_provider UNIQUE (provider_cancellation_id),
    CONSTRAINT ck_v1_payment_cancellations_amount CHECK (amount > 0)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '결제 취소';


CREATE INDEX idx_v1_payments_reservation_created_at ON v1_payments (reservation_id, created_at);
CREATE INDEX idx_v1_payments_status_created_at ON v1_payments (status, created_at);
CREATE INDEX idx_v1_payment_cancellations_payment ON v1_payment_cancellations (payment_id);
CREATE INDEX idx_v1_payment_cancellations_status_created_at ON v1_payment_cancellations (status, created_at);