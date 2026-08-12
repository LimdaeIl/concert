ALTER TABLE v1_members
    MODIFY COLUMN road_address VARCHAR(255)
        COLLATE utf8mb4_unicode_ci
        NULL
        COMMENT '도로명 주소';

ALTER TABLE v1_venues
    MODIFY COLUMN road_address VARCHAR(255)
        COLLATE utf8mb4_unicode_ci
        NULL
        COMMENT '도로명 주소';

ALTER TABLE v1_venues
    MODIFY COLUMN latitude DECIMAL(10,7) NULL COMMENT '위도',
    MODIFY COLUMN longitude DECIMAL(10,7) NULL COMMENT '경도';