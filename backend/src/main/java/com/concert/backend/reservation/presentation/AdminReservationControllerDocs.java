package com.concert.backend.reservation.presentation;

import com.concert.backend.reservation.domain.ReservationStatus;
import com.concert.backend.reservation.presentation.response.GetAdminReservationsResponse;
import com.concert.backend.reservation.query.AdminReservationSortType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(
        name = "Admin Reservation",
        description = "관리자 예약 관리 API"
)
public interface AdminReservationControllerDocs {

    @Operation(
            summary = "관리자 예약 목록 조회",
            description = """
                    관리자가 전체 예약 목록을
                    페이지 단위로 조회합니다.

                    예약번호, 회원 이메일,
                    회원명, 공연명으로 검색할 수 있습니다.

                    예약 상태, 공연 회차 ID,
                    예약 생성일시 범위 필터링을 지원합니다.

                    예약과 함께 회원, 공연,
                    공연 회차, 공연장, 공연홀,
                    최신 결제 정보를 제공합니다.
                    """,
            security = @SecurityRequirement(
                    name = "Bearer Authentication"
            )
    )
    @ApiResponse(
            responseCode = "200",
            description = "예약 목록 조회 성공"
    )
    @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음"
    )
    ResponseEntity<GetAdminReservationsResponse>
    getReservations(
            @Parameter(
                    description = """
                            예약번호, 회원 이메일,
                            회원명 또는 공연명 검색어
                            """,
                    example = "user@example.com"
            )
            @RequestParam(required = false)
            String keyword,

            @Parameter(
                    description = "예약 상태"
            )
            @RequestParam(required = false)
            ReservationStatus status,

            @Parameter(
                    description = "공연 회차 ID",
                    example = "1"
            )
            @RequestParam(required = false)
            Long performanceId,

            @Parameter(
                    description = "예약일시 검색 시작값",
                    example = "2026-08-01T00:00:00"
            )
            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime from,

            @Parameter(
                    description = "예약일시 검색 종료값",
                    example = "2026-08-31T23:59:59"
            )
            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime to,

            @Parameter(
                    description = """
                            정렬 방식

                            RESERVED_AT_DESC
                            RESERVED_AT_ASC
                            PERFORMANCE_DATE_DESC
                            PERFORMANCE_DATE_ASC
                            """
            )
            @RequestParam(
                    defaultValue = "RESERVED_AT_DESC"
            )
            AdminReservationSortType sort,

            @Parameter(
                    description = "페이지 번호 (0부터 시작)",
                    example = "0"
            )
            @RequestParam(defaultValue = "0")
            int page,

            @Parameter(
                    description = "페이지 크기",
                    example = "20"
            )
            @RequestParam(defaultValue = "20")
            int size
    );
}
