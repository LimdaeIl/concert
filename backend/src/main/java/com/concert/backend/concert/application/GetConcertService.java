package com.concert.backend.concert.application;

import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetConcertService {

    private final ConcertRepository concertRepository;

    @Transactional(readOnly = true)
    public ConcertResult getConcert(
            Long concertId
    ) {
        Concert concert = concertRepository
                .findByIdAndStatus(
                        concertId,
                        ConcertStatus.PUBLISHED
                )
                .orElseThrow(() ->
                        new ConcertException(
                                ConcertErrorCode.CONCERT_NOT_FOUND
                        )
                );

        return ConcertResult.from(concert);
    }
}
