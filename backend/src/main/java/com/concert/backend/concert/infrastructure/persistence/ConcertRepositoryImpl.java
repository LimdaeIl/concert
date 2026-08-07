package com.concert.backend.concert.infrastructure.persistence;

import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertRepository;
import com.concert.backend.concert.domain.ConcertStatus;
import com.concert.backend.concert.infrastructure.jpa.JpaConcertRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class ConcertRepositoryImpl
        implements ConcertRepository {

    private final JpaConcertRepository jpaConcertRepository;

    @Override
    public Concert save(Concert concert) {
        return jpaConcertRepository.save(concert);
    }

    @Override
    public Optional<Concert> findById(
            Long concertId
    ) {
        return jpaConcertRepository.findById(concertId);
    }

    @Override
    public Optional<Concert> findByIdAndStatus(
            Long concertId,
            ConcertStatus status
    ) {
        return jpaConcertRepository.findByIdAndStatus(
                concertId,
                status
        );
    }

    @Override
    public List<Concert> findAllByStatus(
            ConcertStatus status
    ) {
        return jpaConcertRepository.findAllByStatus(
                status
        );
    }
}
