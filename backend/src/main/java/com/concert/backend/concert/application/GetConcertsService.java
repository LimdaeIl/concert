package com.concert.backend.concert.application;

import com.concert.backend.concert.application.assembler.ConcertResultAssembler;
import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.domain.ConcertStatus;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetConcertsService {

    private final ConcertRepository
            concertRepository;

    private final ConcertResultAssembler
            concertResultAssembler;

    @Transactional(readOnly = true)
    public List<ConcertResult> getConcerts() {
        return concertRepository
                .findAllByStatus(
                        ConcertStatus.PUBLISHED
                )
                .stream()
                .map(
                        concertResultAssembler::toResult
                )
                .toList();
    }
}
