package com.concert.backend.concert.application.event;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@RequiredArgsConstructor
@Component
public class PopularConcertCacheEvictEventListener {

    private static final String CACHE_NAME =
            "popularConcerts";

    private final CacheManager cacheManager;

    /*
     * ============================================================
     * 인기 공연 Cache 무효화
     * ============================================================
     *
     * Reservation 상태 변경 Transaction이 실제로
     * COMMIT된 이후에만 실행된다.
     *
     * ROLLBACK이 발생하면 AFTER_COMMIT Listener 자체가
     * 실행되지 않으므로 기존 Cache는 유지된다.
     */
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
            PopularConcertCacheEvictEvent event
    ) {

        System.out.println(
                ">>> PopularConcertCacheEvictEvent AFTER_COMMIT"
        );

        Cache cache =
                cacheManager.getCache(
                        CACHE_NAME
                );

        if (cache == null) {
            return;
        }

        /*
         * clear()는 Cache 구현에 따라
         * 지연 수행될 수 있다.
         *
         * invalidate()는 호출이 끝난 뒤
         * 기존 Cache Entry가 즉시 보이지 않도록
         * 보장하는 연산이다.
         *
         * AFTER_COMMIT 시점에서는
         * Cache를 즉시 제거하는 것이 목적이므로
         * invalidate()를 사용한다.
         */
        boolean invalidated =
                cache.invalidate();

        System.out.println(
                ">>> AFTER_COMMIT INVALIDATE"
                        + " | thread="
                        + Thread.currentThread().getName()
                        + " | invalidated="
                        + invalidated
        );
    }
}