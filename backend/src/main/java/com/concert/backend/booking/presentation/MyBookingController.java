package com.concert.backend.booking.presentation;

import com.concert.backend.auth.infrastructure.security.LoginMember;
import com.concert.backend.booking.application.GetMyBookingDetailService;
import com.concert.backend.booking.application.GetMyBookingsService;
import com.concert.backend.booking.application.result.MyBookingDetailResult;
import com.concert.backend.booking.application.result.MyBookingsResult;
import com.concert.backend.booking.presentation.request.GetMyReservationsRequest;
import com.concert.backend.booking.presentation.response.MyBookingDetailResponse;
import com.concert.backend.booking.presentation.response.MyBookingsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/me/reservations")
@RestController
public class MyBookingController
        implements MyBookingControllerDocs {

    private final GetMyBookingsService
            getMyBookingsService;

    private final GetMyBookingDetailService
            getMyBookingDetailService;

    @Override
    @GetMapping
    public ResponseEntity<MyBookingsResponse> getBookings(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @Valid
            @ModelAttribute
            GetMyReservationsRequest request
    ) {
        MyBookingsResult result =
                getMyBookingsService.getBookings(
                        loginMember.memberId(),
                        request
                );

        return ResponseEntity.ok(
                MyBookingsResponse.from(result)
        );
    }

    @Override
    @GetMapping("/{reservationId}")
    public ResponseEntity<MyBookingDetailResponse> getBooking(
            @AuthenticationPrincipal
            LoginMember loginMember,

            @PathVariable
            Long reservationId
    ) {
        MyBookingDetailResult result =
                getMyBookingDetailService.getBooking(
                        loginMember.memberId(),
                        reservationId
                );

        return ResponseEntity.ok(
                MyBookingDetailResponse.from(result)
        );
    }
}
