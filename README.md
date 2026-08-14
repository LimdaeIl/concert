# 콘서트 티켓 예매 플랫폼

> 콘서트 정보 조회부터 공연 회차 및 좌석 선택, 티켓 예매까지의 흐름을 구현한 콘서트 티켓 예매 웹 서비스입니다.

단순 CRUD 중심의 프로젝트가 아니라 실제 티켓 예매 서비스에서 발생할 수 있는 **좌석 선점, 동시 예매, 결제 대기, 예약 취소 및 좌석 상태 변경** 등의 비즈니스 흐름을 깊이 있게 고려하여 설계했습니다.
프론트엔드와 백엔드를 모두 직접 구현하여 사용자 화면부터 API, 데이터베이스까지 전체 서비스 흐름을 구성했습니다.

## 🔗 Quick Links & Test Accounts

- **사용자 화면**: [https://optional94.com](https://optional94.com/)
- **관리자 화면**: https://optional94.com/admin *(관리자 계정 로그인 필요)*
- **API 명세서**: [Swagger UI 바로가기](https://api.optional94.com/swagger-ui/index.html)

### 테스트 계정

| **권한**   | **이메일**         | **비밀번호** | **비고**                      |
| ---------- | ------------------ | ------------ | ----------------------------- |
| **ADMIN**  | `admin@test.com`   | `Admin1234!` | 관리자 전용 기능 테스트       |
| **MEMBER** | `member1@test.com` | `Test1234!`  | 사용자 예매 테스트 1          |
| **MEMBER** | `member2@test.com` | `Test1234!`  | 동시성 예매 테스트용 사용자 2 |


# 서비스 시연 및 핵심 기능
## 사용자 화면
<img width="400" height="400" alt="low-gif" src="https://github.com/user-attachments/assets/e124629c-dda3-4f01-be5d-730629ef1383" />

## 관리자 화면
<img width="600" height="400" alt="admin" src="https://github.com/user-attachments/assets/3d177c50-303a-45ca-a01e-379fedffc31e" />

# 시스템 아키텍처 & ERD
## 시스템 아키텍처
<img width="1012" height="770" alt="image" src="https://github.com/user-attachments/assets/ff43e4ae-f437-4b0b-8f84-6efe3c7fa4c8" />

## ERD
<img width="2541" height="1152" alt="teset" src="https://github.com/user-attachments/assets/ce8e8cad-72dd-4803-b7b9-a83b01131c2f" />

- [dbdiagram으로 테이블 ERD 살펴보기](https://dbdiagram.io/d/optional94-com-6a7ea121c6a866c9076763d3)

# 핵심 기술적 도전 및 문제 해결 (Key Technical Challenges)

| #    | Technical Challenge                         | 핵심                             |
| ---- | ------------------------------------------- | -------------------------------- |
| 1    | **도메인 중심 애플리케이션 구조 설계**      | 계층/모듈 책임 분리, 의존성 관리 |
| 2    | **동시 예약 환경에서 좌석 정합성 보장**     | Race Condition, 비관적 락        |
| 3    | **JPA와 MyBatis를 활용한 조회 책임 분리**   | N+1, 복잡한 조회, Query Model    |
| 4    | **예약-결제 상태 정합성과 만료 처리**       | HELD, 결제, 만료, Toss Payments  |
| 5    | **Redis 캐시를 통한 인기 공연 조회 최적화** | DB 부하, Cache, Eviction         |

- [핵심 기술적 도전 및 문제 해결 살펴보기(Canva)](https://canva.link/dphzjaggabezpkh)



# 성과 및 회고 (Performance & Retrospective)
- 단순 CRUD 구현을 넘어 좌석 선점 → 예약 → 결제 → 만료/취소로 이어지는 실제 티켓 예매의 핵심 비즈니스 흐름을 설계하고 구현했습니다.
- 동시 예매 상황에서 발생하는 Race Condition을 재현하고 비관적 락을 적용하여 좌석 중복 예약을 방지하고 데이터 정합성을 보장했습니다.
- JPA와 MyBatis의 역할을 분리하여 도메인 변경 로직과 복잡한 조회 로직을 각각의 목적에 맞게 구성했습니다.
- Redis 캐시와 예약 만료 처리를 적용하며 성능뿐만 아니라 캐시 정합성, 상태 전이 등 운영 환경에서 발생할 수 있는 문제까지 고려했습니다.
- 프론트엔드부터 백엔드, 데이터베이스, 배포까지 A-Z 모두 직접 구성하며 하나의 기능이 사용자 요청에서 데이터 저장까지 이어지는 전체 서비스 흐름을 경험했습니다.
