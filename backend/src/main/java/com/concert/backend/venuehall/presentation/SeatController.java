package com.concert.backend.venuehall.presentation;

import com.concert.backend.venuehall.application.GetSeatService;
import com.concert.backend.venuehall.application.GetSeatsService;
import com.concert.backend.venuehall.application.result.SeatResult;
import com.concert.backend.venuehall.presentation.response.GetSeatsResponse;
import com.concert.backend.venuehall.presentation.response.SeatResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class SeatController implements SeatControllerDocs {

    private final GetSeatsService getSeatsService;
    private final GetSeatService getSeatService;

    @GetMapping(
            "/api/v1/halls/{venueHallId}/seats"
    )
    public ResponseEntity<GetSeatsResponse> getSeats(
            @PathVariable Long venueHallId
    ) {
        List<SeatResult> results =
                getSeatsService.getSeats(venueHallId);

        return ResponseEntity.ok(
                GetSeatsResponse.from(results)
        );
    }

    @GetMapping("/api/v1/seats/{seatId}")
    public ResponseEntity<SeatResponse> getSeat(
            @PathVariable Long seatId
    ) {
        SeatResult result =
                getSeatService.getSeat(seatId);

        return ResponseEntity.ok(
                SeatResponse.from(result)
        );
    }
}
