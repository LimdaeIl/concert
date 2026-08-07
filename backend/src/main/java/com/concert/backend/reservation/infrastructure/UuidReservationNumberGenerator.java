package com.concert.backend.reservation.infrastructure;

import com.concert.backend.reservation.domain.ReservationNumberGenerator;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class UuidReservationNumberGenerator
        implements ReservationNumberGenerator {

    @Override
    public String generate() {
        return "R"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 20)
                .toUpperCase();
    }
}
