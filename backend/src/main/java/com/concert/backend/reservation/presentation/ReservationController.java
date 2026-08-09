package com.concert.backend.reservation.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.reservation.application.CancelReservationService;
import com.concert.backend.reservation.application.CreateReservationService;
import com.concert.backend.reservation.application.GetMyReservationsService;
import com.concert.backend.reservation.application.GetReservationService;
import com.concert.backend.reservation.application.result.ReservationResult;
import com.concert.backend.reservation.presentation.request.CreateReservationRequest;
import com.concert.backend.reservation.presentation.response.GetReservationsResponse;
import com.concert.backend.reservation.presentation.response.ReservationResponse;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1")
@RestController
public class ReservationController
        implements ReservationControllerDocs {

    private final CreateReservationService
            createReservationService;
    private final GetMyReservationsService
            getMyReservationsService;
    private final GetReservationService
            getReservationService;
    private final CancelReservationService
            cancelReservationService;

    @Override
    @PostMapping(
            "/performances/{performanceId}/reservations"
    )
    public ResponseEntity<ReservationResponse> create(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long performanceId,

            @Valid
            @RequestBody
            CreateReservationRequest request
    ) {
        ReservationResult result =
                createReservationService.create(
                        loginMember.memberId(),
                        performanceId,
                        request.toCommand()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ReservationResponse.from(result)
                );
    }

    @Override
    @GetMapping("/reservations/my")
    public ResponseEntity<GetReservationsResponse>
    getMyReservations(
            @AuthenticationPrincipal
            LoginMember loginMember
    ) {
        List<ReservationResult> results =
                getMyReservationsService
                        .getReservations(
                                loginMember.memberId()
                        );

        return ResponseEntity.ok(
                GetReservationsResponse.from(results)
        );
    }

    @Override
    @GetMapping(
            "/reservations/{reservationId}"
    )
    public ResponseEntity<ReservationResponse>
    getReservation(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long reservationId
    ) {
        ReservationResult result =
                getReservationService.getReservation(
                        loginMember.memberId(),
                        reservationId
                );

        return ResponseEntity.ok(
                ReservationResponse.from(result)
        );
    }

    @Override
    @DeleteMapping(
            "/reservations/{reservationId}"
    )
    public ResponseEntity<Void>
    cancelPendingReservation(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long reservationId
    ) {
        cancelReservationService
                .cancelPendingReservation(
                        loginMember.memberId(),
                        reservationId,
                        LocalDateTime.now()
                );

        return ResponseEntity.noContent()
                .build();
    }

}
