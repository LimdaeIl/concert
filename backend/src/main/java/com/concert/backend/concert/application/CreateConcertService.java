package com.concert.backend.concert.application;

import com.concert.backend.concert.application.assembler.ConcertResultAssembler;
import com.concert.backend.concert.application.command.CreateConcertCommand;
import com.concert.backend.concert.application.result.ConcertResult;
import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CreateConcertService {

    private final ConcertRepository
            concertRepository;

    private final ConcertResultAssembler
            concertResultAssembler;

    @Transactional
    public ConcertResult create(
            CreateConcertCommand command
    ) {
        Concert concert =
                Concert.create(
                        command.title(),
                        command.subtitle(),
                        command.description(),
                        command.category(),
                        command.runningTime(),
                        command.ageRating()
                );

        Concert savedConcert =
                concertRepository.save(
                        concert
                );

        return concertResultAssembler
                .toResult(
                        savedConcert
                );
    }
}
