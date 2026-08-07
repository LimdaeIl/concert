package com.concert.backend.concert.domain;

import java.util.List;
import java.util.Optional;

public interface ConcertRepository {

    Concert save(Concert concert);

    Optional<Concert> findById(Long concertId);

    Optional<Concert> findByIdAndStatus(
            Long concertId,
            ConcertStatus status
    );

    List<Concert> findAllByStatus(
            ConcertStatus status
    );
}
