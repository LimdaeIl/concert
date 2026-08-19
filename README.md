# 콘서트 티켓 예매 플랫폼

> 콘서트 정보 조회부터 공연 회차 및 좌석 선택, 티켓 예매까지의 흐름을 구현한 콘서트 티켓 예매 웹 서비스입니다.

단순 CRUD 중심의 프로젝트가 아니라 실제 티켓 예매 서비스에서 발생할 수 있는 **좌석 선점, 동시 예매, 결제 대기, 예약 취소 및 좌석 상태 변경** 등의 비즈니스 흐름을 깊이 있게 고려하여 설계했습니다.
프론트엔드와 백엔드를 모두 직접 구현하여 사용자 화면부터 API, 데이터베이스까지 전체 서비스 흐름을 구성했습니다.

---

## 빠른 이동 & 테스트 계정

- **사용자 화면**: [https://optional94.com](https://optional94.com/)
- **관리자 화면**: https://optional94.com/admin *(관리자 계정 로그인 필요)*
- **API 명세서**: [Swagger UI 바로가기](https://api.optional94.com/swagger-ui/index.html)
- **ERD 명세서🌟**: [ERD 바로가기(dbdiagram)](https://dbdiagram.io/d/optional94-com-6a7ea121c6a866c9076763d3)
- **기술 도전 및 문제 해결🌟**: [핵심 기술적 도전 및 문제 해결 살펴보기(Canva)](https://canva.link/dphzjaggabezpkh)

---

### 테스트 계정

| **권한**   | **이메일**         | **비밀번호** | **비고**                      |
| ---------- | ------------------ | ------------ | ----------------------------- |
| **ADMIN**  | `admin@test.com`   | `Admin1234!` | 관리자 전용 기능 테스트       |
| **MEMBER** | `member1@test.com` | `Test1234!`  | 사용자 예매 테스트 1          |
| **MEMBER** | `member2@test.com` | `Test1234!`  | 동시성 예매 테스트용 사용자 2 |

---

## Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat-square)
![Axios](https://img.shields.io/badge/Axios-1-5A29E4?style=flat-square&logo=axios&logoColor=white)

### Backend

![Java](https://img.shields.io/badge/Java-25-007396?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.7-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=flat-square&logo=spring&logoColor=white)
![MyBatis](https://img.shields.io/badge/MyBatis-4.0.1-DC382D?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-0.13.0-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![OAuth2](https://img.shields.io/badge/OAuth2-3C3C3D?style=flat-square)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=flat-square&logo=swagger&logoColor=black)

### Database & Cache

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.4-FF4438?style=flat-square&logo=redis&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-CC0200?style=flat-square&logo=flyway&logoColor=white)

### Infrastructure

![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20S3%20%7C%20VPC-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)

### Monitoring & Logging

![Prometheus](https://img.shields.io/badge/Prometheus-3.13.1-E6522C?style=flat-square&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-13.1.3-F46800?style=flat-square&logo=grafana&logoColor=white)
![Loki](https://img.shields.io/badge/Loki-3.7.0-F46800?style=flat-square&logo=grafana&logoColor=white)
![Grafana Alloy](https://img.shields.io/badge/Grafana_Alloy-1.18.1-F46800?style=flat-square&logo=grafana&logoColor=white)

### External Services

![Google](https://img.shields.io/badge/Google-OAuth2-4285F4?style=flat-square&logo=google&logoColor=white)
![Kakao](https://img.shields.io/badge/Kakao-OAuth2-FFCD00?style=flat-square&logo=kakao&logoColor=000000)
![GitHub](https://img.shields.io/badge/GitHub-OAuth2-181717?style=flat-square&logo=github&logoColor=white)
![SOLAPI](https://img.shields.io/badge/SOLAPI-SMS-5C2D91?style=flat-square)

---

## 서비스 시연 및 핵심 기능
### 사용자
- 이메일 및 Google / Kakao / GitHub OAuth2 로그인
- 공연 목록 및 상세 정보 조회
- 공연 회차 및 실시간 예약 가능 좌석 조회
- 좌석 선택 및 선점
- 공연 티켓 예약 및 결제
- 예약 내역 조회 및 예약 취소
- 프로필 및 회원 정보 관리
<img width="600" height="600" alt="low-gif" src="https://github.com/user-attachments/assets/e124629c-dda3-4f01-be5d-730629ef1383" />

### 관리자
- 공연 및 공연 회차 관리
- 공연장 및 좌석 관리
- 회차별 좌석 등급 및 가격 관리
- 회원 및 서비스 운영 관리
<img width="600" height="400" alt="admin" src="https://github.com/user-attachments/assets/3d177c50-303a-45ca-a01e-379fedffc31e" />

## 시스템 아키텍처 & ERD
### 시스템 아키텍처
<img width="763" height="1092" alt="system-architecture drawio" src="https://github.com/user-attachments/assets/010a4a45-069a-4b2b-b628-b8a896743f97" />

- Cloudflare를 통해 도메인 및 외부 요청을 관리합니다.
- Nginx를 Reverse Proxy로 구성하여 Frontend와 Backend 요청을 분리합니다.
- Spring Boot 애플리케이션은 AWS EC2에서 운영하며 MySQL은 RDS를 사용합니다.
- 이미지 파일은 S3에 저장하고 Redis를 캐시 및 좌석 관련 처리에 활용합니다.
- Prometheus와 Grafana를 통한 Metrics 모니터링, Loki와 Alloy를 통한 로그 수집 환경을 구성했습니다.

---

### ERD
<img width="2541" height="1152" alt="teset" src="https://github.com/user-attachments/assets/ce8e8cad-72dd-4803-b7b9-a83b01131c2f" />

- [ERD 살펴보기(dbdiagram)](https://dbdiagram.io/d/optional94-com-6a7ea121c6a866c9076763d3)

---

## 핵심 기술적 도전 및 문제 해결 (Key Technical Challenges)

| # | Technical Challenge | 문제 | 해결 |
| --- | --- | --- | --- |
| 1 | **도메인 중심 구조 설계** | 비즈니스 로직과 인프라 코드의 결합 | 계층/모듈 책임 분리 및 의존성 관리 |
| 2 | **좌석 동시성 제어** | 동일 좌석 동시 예약 시 Race Condition 발생 | 비관적 락을 적용하여 좌석 중복 예약 방지 |
| 3 | **조회 성능 개선** | 연관관계 조회의 N+1 및 복잡한 조회 증가 | JPA와 MyBatis의 Command/Query 책임 분리 |
| 4 | **예약-결제 정합성** | 결제 도중 이탈 시 좌석이 계속 점유되는 문제 | HELD 상태와 만료 시간을 기반으로 좌석 자동 반환 |
| 5 | **인기 공연 조회 최적화** | 반복 조회로 인한 DB 부하 | Redis Cache 적용 및 Eviction 전략 구성 |

- [핵심 기술적 도전 및 문제 해결 살펴보기(Canva)](https://canva.link/dphzjaggabezpkh)

---


## 성과 및 회고 (Performance & Retrospective)
- 단순 CRUD 구현을 넘어 좌석 선점 → 예약 → 결제 → 만료/취소로 이어지는 실제 티켓 예매의 핵심 비즈니스 흐름을 설계하고 구현했습니다.
- 동시 예매 상황에서 발생하는 Race Condition을 재현하고 비관적 락을 적용하여 좌석 중복 예약을 방지하고 데이터 정합성을 보장했습니다.
- JPA와 MyBatis의 역할을 분리하여 도메인 변경 로직과 복잡한 조회 로직을 각각의 목적에 맞게 구성했습니다.
- Redis 캐시와 예약 만료 처리를 적용하며 성능뿐만 아니라 캐시 정합성, 상태 전이 등 운영 환경에서 발생할 수 있는 문제까지 고려했습니다.
- 프론트엔드부터 백엔드, 데이터베이스, 배포까지 A-Z 모두 직접 구성하며 하나의 기능이 사용자 요청에서 데이터 저장까지 이어지는 전체 서비스 흐름을 경험했습니다.
