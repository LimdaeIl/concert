package com.concert.backend.concert.presentation;

import com.concert.backend.concert.application.GetConcertService;
import com.concert.backend.concert.application.GetConcertsService;
import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.presentation.response.ConcertResponse;
import com.concert.backend.concert.presentation.response.GetConcertsResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/v1/concerts")
@RestController
public class ConcertController implements ConcertControllerDocs {

    private final GetConcertsService getConcertsService;
    private final GetConcertService getConcertService;

    @GetMapping
    public ResponseEntity<GetConcertsResponse> getConcerts() {
        List<ConcertResult> results =
                getConcertsService.getConcerts();

        return ResponseEntity.ok(
                GetConcertsResponse.from(results)
        );
    }

    @GetMapping("/{concertId}")
    public ResponseEntity<ConcertResponse> getConcert(
            @PathVariable Long concertId
    ) {
        ConcertResult result =
                getConcertService.getConcert(concertId);

        return ResponseEntity.ok(
                ConcertResponse.from(result)
        );
    }
}
