package com.concert.backend.concert.application;

import com.concert.backend.concert.application.assembler.ConcertResultAssembler;
import com.concert.backend.concert.application.command.UpdateConcertCommand;
import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UpdateConcertService {

    private final ConcertRepository
            concertRepository;

    private final ConcertResultAssembler
            concertResultAssembler;

    @Transactional
    public ConcertResult update(
            Long concertId,
            UpdateConcertCommand command
    ) {
        Concert concert =
                concertRepository
                        .findById(
                                concertId
                        )
                        .orElseThrow(
                                () ->
                                        new ConcertException(
                                                ConcertErrorCode.CONCERT_NOT_FOUND
                                        )
                        );

        concert.update(
                command.title(),
                command.subtitle(),
                command.description(),
                command.category(),
                command.runningTime(),
                command.ageRating()
        );

        return concertResultAssembler
                .toResult(
                        concert
                );
    }
}
