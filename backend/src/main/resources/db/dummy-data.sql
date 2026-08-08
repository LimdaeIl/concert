-- ============================================================
-- Concert 개발용 더미 데이터
--
-- 기준일: 2026-08
--
-- 주의:
--   개발 환경 전용
--   기존 회원 / 공연 / 예약 / 결제 데이터를 삭제한다.
-- 권한	이메일	비밀번호
-- ADMIN	admin@test.com	Admin1234!
-- MANAGER	manager@test.com	Manager1234!
-- MEMBER	member1@test.com	Test1234!
-- MEMBER	member2@test.com	Test1234!
-- ============================================================


-- ============================================================
-- 0. 기존 데이터 제거
-- ============================================================

DELETE FROM v1_payment_cancellations;
DELETE FROM v1_payments;

DELETE FROM v1_reservation_seats;
DELETE FROM v1_reservations;

DELETE FROM v1_performance_seats;
DELETE FROM v1_performances;

DELETE FROM v1_concerts;

DELETE FROM v1_seats;
DELETE FROM v1_venue_halls;
DELETE FROM v1_venues;

DELETE FROM v1_member_social_accounts;
DELETE FROM v1_members;


-- ============================================================
-- 1. 회원
-- ============================================================
--
-- BCrypt 암호화 비밀번호
--
-- 일반회원:
-- member1@test.com
-- member2@test.com
-- Test1234!
--
-- 관리자:
-- admin@test.com
-- Admin1234!
--
-- 매니저:
-- manager@test.com
-- Manager1234!
-- ============================================================

INSERT INTO v1_members
(
    id,
    email,
    password,
    name,
    phone,
    role,
    status,
    road_address,
    jibun_address,
    detail_address,
    zip_code,
    latitude,
    longitude,
    created_at,
    updated_at,
    withdrawn_at
)
VALUES
    (
        1,
        'admin@test.com',
        '$2a$10$CJsqnFNJS8.4QBWmT4VN3./1CA19VXu3W1hJmE/QBI7xsZqzKmAjK',
        '관리자',
        '01010000001',
        'ADMIN',
        'ACTIVE',
        '서울특별시 강남구 테헤란로 123',
        '서울특별시 강남구 역삼동 123',
        '10층',
        '06234',
        NULL,
        NULL,
        NOW(6),
        NOW(6),
        NULL
    ),
    (
        2,
        'manager@test.com',
        '$2a$10$.hwFvW4ZNjnahcreBH/zu.s8AhBQSmVVYKaGDokpno4gn2gJuWAGy',
        '공연 매니저',
        '01010000002',
        'MANAGER',
        'ACTIVE',
        '서울특별시 송파구 올림픽로 300',
        '서울특별시 송파구 신천동 29',
        '5층',
        '05551',
        NULL,
        NULL,
        NOW(6),
        NOW(6),
        NULL
    ),
    (
        3,
        'member1@test.com',
        '$2a$10$QTRpTrm4EJcKaa/Ezyt0Y.MbZFLd3TvYPnV/uWQtX7ydkbujjpAeG',
        '김콘서트',
        '01020000001',
        'MEMBER',
        'ACTIVE',
        '서울특별시 마포구 월드컵북로 400',
        '서울특별시 마포구 상암동 1605',
        '101동 1001호',
        '03925',
        NULL,
        NULL,
        NOW(6),
        NOW(6),
        NULL
    ),
    (
        4,
        'member2@test.com',
        '$2a$10$QTRpTrm4EJcKaa/Ezyt0Y.MbZFLd3TvYPnV/uWQtX7ydkbujjpAeG',
        '이뮤지컬',
        '01020000002',
        'MEMBER',
        'ACTIVE',
        '서울특별시 영등포구 여의대로 108',
        '서울특별시 영등포구 여의도동 22',
        '202동 1502호',
        '07335',
        NULL,
        NULL,
        NOW(6),
        NOW(6),
        NULL
    );


-- ============================================================
-- 2. 공연장
-- ============================================================

INSERT INTO v1_venues
(
    id,
    name,
    phone,
    status,
    road_address,
    jibun_address,
    detail_address,
    zip_code,
    latitude,
    longitude,
    created_by,
    created_at,
    updated_by,
    updated_at
)
VALUES
    (
        1,
        '콘서트 아트센터',
        '02-1000-1000',
        'ACTIVE',
        '서울특별시 송파구 올림픽로 424',
        '서울특별시 송파구 방이동 88',
        NULL,
        '05540',
        37.5199550,
        127.1155530,
        1,
        NOW(6),
        1,
        NOW(6)
    ),
    (
        2,
        '서울 뮤직홀',
        '02-2000-2000',
        'ACTIVE',
        '서울특별시 종로구 세종대로 175',
        '서울특별시 종로구 세종로 1-68',
        NULL,
        '03172',
        37.5716070,
        126.9769090,
        1,
        NOW(6),
        1,
        NOW(6)
    );


-- ============================================================
-- 3. 공연홀
-- ============================================================

INSERT INTO v1_venue_halls
(
    id,
    venue_id,
    name,
    floor,
    capacity,
    status,
    created_by,
    created_at,
    updated_by,
    updated_at
)
VALUES
    (
        1,
        1,
        '그랜드홀',
        '1층',
        16,
        'ACTIVE',
        1,
        NOW(6),
        1,
        NOW(6)
    ),
    (
        2,
        2,
        '블루홀',
        'B1',
        16,
        'ACTIVE',
        1,
        NOW(6),
        1,
        NOW(6)
    );


-- ============================================================
-- 4. 좌석
--
-- 홀당 16석
-- A열 8석 + B열 8석
-- ============================================================


-- ------------------------------------------------------------
-- 그랜드홀
-- ------------------------------------------------------------

INSERT INTO v1_seats
(
    id,
    venue_hall_id,
    section_name,
    floor,
    row_name,
    seat_number,
    seat_type,
    status,
    created_by,
    created_at,
    updated_by,
    updated_at
)
VALUES
    (1, 1, 'CENTER', 1, 'A', '1', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (2, 1, 'CENTER', 1, 'A', '2', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (3, 1, 'CENTER', 1, 'A', '3', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (4, 1, 'CENTER', 1, 'A', '4', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (5, 1, 'CENTER', 1, 'A', '5', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (6, 1, 'CENTER', 1, 'A', '6', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (7, 1, 'CENTER', 1, 'A', '7', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (8, 1, 'CENTER', 1, 'A', '8', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),

    (9, 1, 'CENTER', 1, 'B', '1', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (10, 1, 'CENTER', 1, 'B', '2', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (11, 1, 'CENTER', 1, 'B', '3', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (12, 1, 'CENTER', 1, 'B', '4', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (13, 1, 'CENTER', 1, 'B', '5', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (14, 1, 'CENTER', 1, 'B', '6', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (15, 1, 'CENTER', 1, 'B', '7', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (16, 1, 'CENTER', 1, 'B', '8', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6));


-- ------------------------------------------------------------
-- 블루홀
-- ------------------------------------------------------------

INSERT INTO v1_seats
(
    id,
    venue_hall_id,
    section_name,
    floor,
    row_name,
    seat_number,
    seat_type,
    status,
    created_by,
    created_at,
    updated_by,
    updated_at
)
VALUES
    (17, 2, 'ORCHESTRA', 1, 'A', '1', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (18, 2, 'ORCHESTRA', 1, 'A', '2', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (19, 2, 'ORCHESTRA', 1, 'A', '3', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (20, 2, 'ORCHESTRA', 1, 'A', '4', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (21, 2, 'ORCHESTRA', 1, 'A', '5', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (22, 2, 'ORCHESTRA', 1, 'A', '6', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (23, 2, 'ORCHESTRA', 1, 'A', '7', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (24, 2, 'ORCHESTRA', 1, 'A', '8', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),

    (25, 2, 'ORCHESTRA', 1, 'B', '1', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (26, 2, 'ORCHESTRA', 1, 'B', '2', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (27, 2, 'ORCHESTRA', 1, 'B', '3', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (28, 2, 'ORCHESTRA', 1, 'B', '4', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (29, 2, 'ORCHESTRA', 1, 'B', '5', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (30, 2, 'ORCHESTRA', 1, 'B', '6', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (31, 2, 'ORCHESTRA', 1, 'B', '7', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6)),
    (32, 2, 'ORCHESTRA', 1, 'B', '8', 'STANDARD', 'ACTIVE', 1, NOW(6), 1, NOW(6));


-- ============================================================
-- 5. 공연
--
-- poster_url은 S3 연동 전이므로 전부 NULL
-- 프론트 ConcertPoster가 기본 이미지를 표시한다.
--
-- category:
-- CONCERT / MUSICAL / PLAY / CLASSIC / DANCE / ETC
-- ============================================================

INSERT INTO v1_concerts
(
    id,
    title,
    subtitle,
    description,
    category,
    running_time,
    age_rating,
    poster_url,
    status,
    created_by,
    created_at,
    updated_by,
    updated_at
)
VALUES
    (
        1,
        'NEON CITY LIVE 2026',
        '빛나는 여름밤의 라이브',
        '강렬한 밴드 사운드와 화려한 무대 연출이 함께하는 도심형 라이브 콘서트입니다.',
        'CONCERT',
        120,
        'AGE_12',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    ),
    (
        2,
        'AUTUMN BAND FESTIVAL',
        '가을을 여는 밴드 페스티벌',
        '다양한 장르의 인디 밴드가 한 무대에서 펼치는 라이브 페스티벌입니다.',
        'CONCERT',
        150,
        'AGE_12',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    ),
    (
        3,
        '뮤지컬 마지막 편지',
        '당신에게 보내지 못한 이야기',
        '한 통의 편지를 중심으로 펼쳐지는 감성적인 창작 뮤지컬입니다.',
        'MUSICAL',
        140,
        'AGE_12',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    ),
    (
        4,
        '연극 ROOM 404',
        '사라진 방의 비밀',
        '호텔 404호에서 벌어지는 미스터리 사건을 다룬 몰입형 연극입니다.',
        'PLAY',
        100,
        'AGE_15',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    ),
    (
        5,
        'SEOUL SYMPHONY NIGHT',
        '한여름 밤의 클래식',
        '오케스트라가 선보이는 대표 클래식 작품과 영화 음악의 밤입니다.',
        'CLASSIC',
        110,
        'ALL',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    ),
    (
        6,
        'MOTION : ZERO',
        '움직임이 시작되는 순간',
        '현대무용과 미디어아트를 결합한 새로운 형태의 퍼포먼스 공연입니다.',
        'DANCE',
        90,
        'AGE_7',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    ),
    (
        7,
        'MAGIC & ILLUSION',
        '믿을 수 없는 순간',
        '마술과 일루전 퍼포먼스를 온 가족이 함께 즐길 수 있는 공연입니다.',
        'ETC',
        90,
        'ALL',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    ),
    (
        8,
        'ACOUSTIC NIGHT',
        '우리들의 작은 음악회',
        '어쿠스틱 기타와 보컬 중심으로 진행되는 편안한 분위기의 라이브 공연입니다.',
        'CONCERT',
        100,
        'ALL',
        NULL,
        'PUBLISHED',
        2,
        NOW(6),
        2,
        NOW(6)
    );


-- ============================================================
-- 6. 공연 회차
--
-- 현재 기준: 2026-08-08
--
-- OPEN      = 현재 예매 가능
-- SCHEDULED = 예매 시작 전
--
-- 한 홀의 같은 시간 중복 불가
-- ============================================================

INSERT INTO v1_performances
(
    id,
    concert_id,
    venue_hall_id,
    starts_at,
    ends_at,
    reservation_opens_at,
    reservation_closes_at,
    max_tickets_per_member,
    status,
    created_by,
    created_at,
    updated_by,
    updated_at
)
VALUES

-- ------------------------------------------------------------
-- NEON CITY LIVE 2026
-- ------------------------------------------------------------

(
    1,
    1,
    1,
    '2026-08-15 19:00:00',
    '2026-08-15 21:00:00',
    '2026-08-01 10:00:00',
    '2026-08-15 18:00:00',
    4,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    2,
    1,
    1,
    '2026-08-16 18:00:00',
    '2026-08-16 20:00:00',
    '2026-08-01 10:00:00',
    '2026-08-16 17:00:00',
    4,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),

-- ------------------------------------------------------------
-- AUTUMN BAND FESTIVAL
-- ------------------------------------------------------------

(
    3,
    2,
    1,
    '2026-08-22 18:00:00',
    '2026-08-22 20:30:00',
    '2026-08-01 10:00:00',
    '2026-08-22 17:00:00',
    4,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    4,
    2,
    1,
    '2026-08-23 18:00:00',
    '2026-08-23 20:30:00',
    '2026-08-01 10:00:00',
    '2026-08-23 17:00:00',
    4,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),

-- ------------------------------------------------------------
-- 뮤지컬 마지막 편지
-- ------------------------------------------------------------

(
    5,
    3,
    2,
    '2026-08-14 19:30:00',
    '2026-08-14 21:50:00',
    '2026-08-01 10:00:00',
    '2026-08-14 18:30:00',
    2,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    6,
    3,
    2,
    '2026-08-15 15:00:00',
    '2026-08-15 17:20:00',
    '2026-08-01 10:00:00',
    '2026-08-15 14:00:00',
    2,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),

-- ------------------------------------------------------------
-- ROOM 404
-- ------------------------------------------------------------

(
    7,
    4,
    2,
    '2026-08-20 20:00:00',
    '2026-08-20 21:40:00',
    '2026-08-01 10:00:00',
    '2026-08-20 19:00:00',
    2,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    8,
    4,
    2,
    '2026-08-21 20:00:00',
    '2026-08-21 21:40:00',
    '2026-08-01 10:00:00',
    '2026-08-21 19:00:00',
    2,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),

-- ------------------------------------------------------------
-- SEOUL SYMPHONY NIGHT
-- ------------------------------------------------------------

(
    9,
    5,
    1,
    '2026-08-29 19:00:00',
    '2026-08-29 20:50:00',
    '2026-08-01 10:00:00',
    '2026-08-29 18:00:00',
    4,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    10,
    5,
    1,
    '2026-08-30 17:00:00',
    '2026-08-30 18:50:00',
    '2026-08-01 10:00:00',
    '2026-08-30 16:00:00',
    4,
    'OPEN',
    2,
    NOW(6),
    2,
    NOW(6)
),

-- ------------------------------------------------------------
-- MOTION : ZERO
-- ------------------------------------------------------------

(
    11,
    6,
    2,
    '2026-09-05 19:00:00',
    '2026-09-05 20:30:00',
    '2026-08-20 10:00:00',
    '2026-09-05 18:00:00',
    2,
    'SCHEDULED',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    12,
    6,
    2,
    '2026-09-06 17:00:00',
    '2026-09-06 18:30:00',
    '2026-08-20 10:00:00',
    '2026-09-06 16:00:00',
    2,
    'SCHEDULED',
    2,
    NOW(6),
    2,
    NOW(6)
),

-- ------------------------------------------------------------
-- MAGIC & ILLUSION
-- ------------------------------------------------------------

(
    13,
    7,
    1,
    '2026-09-12 14:00:00',
    '2026-09-12 15:30:00',
    '2026-08-25 10:00:00',
    '2026-09-12 13:00:00',
    4,
    'SCHEDULED',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    14,
    7,
    1,
    '2026-09-13 14:00:00',
    '2026-09-13 15:30:00',
    '2026-08-25 10:00:00',
    '2026-09-13 13:00:00',
    4,
    'SCHEDULED',
    2,
    NOW(6),
    2,
    NOW(6)
),

-- ------------------------------------------------------------
-- ACOUSTIC NIGHT
-- ------------------------------------------------------------

(
    15,
    8,
    2,
    '2026-09-19 19:00:00',
    '2026-09-19 20:40:00',
    '2026-08-30 10:00:00',
    '2026-09-19 18:00:00',
    2,
    'SCHEDULED',
    2,
    NOW(6),
    2,
    NOW(6)
),
(
    16,
    8,
    2,
    '2026-09-20 18:00:00',
    '2026-09-20 19:40:00',
    '2026-08-30 10:00:00',
    '2026-09-20 17:00:00',
    2,
    'SCHEDULED',
    2,
    NOW(6),
    2,
    NOW(6)
);


-- ============================================================
-- 7. 공연 회차별 좌석 자동 생성
--
-- 해당 공연의 공연홀 좌석을 전부 복사해서 생성
--
-- A열 = VIP
-- B열 = R
-- ============================================================

INSERT INTO v1_performance_seats
(
    performance_id,
    seat_id,
    grade,
    price,
    status,
    held_by,
    held_until,
    version,
    created_by,
    created_at,
    updated_by,
    updated_at
)
SELECT
    p.id,
    s.id,

    CASE
        WHEN s.row_name = 'A'
            THEN 'VIP'
        ELSE 'R'
        END,

    CASE
        WHEN s.row_name = 'A'
            THEN 150000
        ELSE 100000
        END,

    'AVAILABLE',
    NULL,
    NULL,
    0,
    2,
    NOW(6),
    2,
    NOW(6)

FROM v1_performances p

         INNER JOIN v1_seats s
                    ON s.venue_hall_id = p.venue_hall_id

WHERE s.status = 'ACTIVE';


-- ============================================================
-- 8. 일부 좌석 BLOCKED 처리
--
-- 좌석 선택 UI에서 "선택 불가" 상태 테스트용
-- 각 회차의 8번 좌석을 BLOCKED 처리
-- ============================================================

UPDATE v1_performance_seats ps

    INNER JOIN v1_seats s
    ON s.id = ps.seat_id

SET
    ps.status = 'BLOCKED',
    ps.updated_at = NOW(6)

WHERE s.seat_number = '8';


-- ============================================================
-- 9. AUTO_INCREMENT 보정
-- ============================================================

ALTER TABLE v1_members AUTO_INCREMENT = 100;
ALTER TABLE v1_venues AUTO_INCREMENT = 100;
ALTER TABLE v1_venue_halls AUTO_INCREMENT = 100;
ALTER TABLE v1_seats AUTO_INCREMENT = 100;
ALTER TABLE v1_concerts AUTO_INCREMENT = 100;
ALTER TABLE v1_performances AUTO_INCREMENT = 100;
