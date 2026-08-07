package com.concert.backend.concert.infrastructure.jpa;

import com.concert.backend.concert.domain.Concert;
import com.concert.backend.concert.domain.ConcertStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaConcertRepository
        extends JpaRepository<Concert, Long> {

    Optional<Concert> findByIdAndStatus(
            Long id,
            ConcertStatus status
    );

    List<Concert> findAllByStatus(
            ConcertStatus status
    );
}
