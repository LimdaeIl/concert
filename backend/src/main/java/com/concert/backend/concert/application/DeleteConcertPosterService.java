package com.concert.backend.concert.application;

import com.concert.backend.common.storage.event.S3ObjectDeleteEvent;
import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.exception.ConcertErrorCode;
import com.concert.backend.concert.exception.ConcertException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class DeleteConcertPosterService {

    private final ConcertRepository
            concertRepository;

    private final ApplicationEventPublisher
            eventPublisher;

    @Transactional
    public void delete(
            Long concertId
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

        String previousObjectKey =
                concert.getPosterUrl();

        if (previousObjectKey == null
                || previousObjectKey.isBlank()) {
            return;
        }

        concert.removePoster();

        eventPublisher.publishEvent(
                new S3ObjectDeleteEvent(
                        previousObjectKey
                )
        );
    }
}
