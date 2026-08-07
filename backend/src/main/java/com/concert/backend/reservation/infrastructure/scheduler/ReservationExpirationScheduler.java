package com.concert.backend.reservation.infrastructure.scheduler;

import com.concert.backend.reservation.application.ExpireReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class ReservationExpirationScheduler {

    private static final int BATCH_SIZE = 100;

    private final ExpireReservationService
            expireReservationService;

    @Scheduled(
            fixedDelayString =
                    "${app.reservation.expiration-scan-delay:10000}"
    )
    public void expireReservations() {
        int expiredCount =
                expireReservationService.expire(
                        BATCH_SIZE
                );

        if (expiredCount > 0) {
            log.info(
                    "만료 예약 정리 완료. count={}",
                    expiredCount
            );
        }
    }
}
