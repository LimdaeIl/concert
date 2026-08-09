package com.concert.backend.booking.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.booking.application.GetReservationContextService;
import com.concert.backend.booking.presentation.response.GetReservationContextResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/me/performances")
@RestController
public class MyPerformanceReservationController
        implements MyPerformanceReservationControllerDocs {

    private final GetReservationContextService
            getReservationContextService;

    @Override
    @GetMapping("/{performanceId}/reservation-context")
    public ResponseEntity<GetReservationContextResponse>
    getReservationContext(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long performanceId
    ) {
        return ResponseEntity.ok(
                GetReservationContextResponse.from(
                        getReservationContextService.get(
                                loginMember.memberId(),
                                performanceId
                        )
                )
        );
    }
}
