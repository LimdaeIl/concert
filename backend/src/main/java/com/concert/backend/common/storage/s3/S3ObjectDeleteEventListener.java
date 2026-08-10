package com.concert.backend.common.storage.s3;

import com.concert.backend.common.storage.event.S3ObjectDeleteEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@RequiredArgsConstructor
@Component
public class S3ObjectDeleteEventListener {

    private final S3ObjectService s3ObjectService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
            S3ObjectDeleteEvent event
    ) {
        try {
            s3ObjectService.delete(
                    event.objectKey()
            );

        } catch (RuntimeException exception) {

            /*
             * DB commit은 이미 완료되었다.
             *
             * 향후 retry / outbox로 개선할 대상.
             */
            log.error(
                    "S3 object 삭제에 실패했습니다. objectKey={}",
                    event.objectKey(),
                    exception
            );
        }
    }
}
