package com.concert.backend.payment.application;

import com.concert.backend.payment.application.result.PaymentCancellationPreparationResult;
import com.concert.backend.payment.domain.Payment;
import com.concert.backend.payment.domain.PaymentCancellation;
import com.concert.backend.payment.domain.PaymentCancellationNumberGenerator;
import com.concert.backend.payment.domain.PaymentCancellationRepository;
import com.concert.backend.payment.domain.PaymentRepository;
import com.concert.backend.payment.exception.PaymentErrorCode;
import com.concert.backend.payment.exception.PaymentException;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class StartPaymentCancellationService {

    private final PerformanceRepository
            performanceRepository;

    private final PaymentCancellationRepository
            paymentCancellationRepository;

    private final PaymentRepository paymentRepository;

    private final ReservationRepository
            reservationRepository;

    private final PaymentCancellationNumberGenerator
            cancellationNumberGenerator;

    private final Clock clock;


    @Transactional
    public PaymentCancellationPreparationResult
    startFullCancellation(
            Long memberId,
            Long paymentId,
            String reason
    ) {
        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode.PAYMENT_NOT_FOUND
                                )
                        );

        Reservation reservation =
                reservationRepository
                        .findByIdAndMemberId(
                                payment.getReservationId(),
                                memberId
                        )
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode.PAYMENT_NOT_FOUND
                                )
                        );

        Performance performance =
                performanceRepository
                        .findById(
                                reservation.getPerformanceId()
                        )
                        .orElseThrow(() ->
                                new PerformanceException(
                                        PerformanceErrorCode
                                                .PERFORMANCE_NOT_FOUND
                                )
                        );

        LocalDateTime now =
                LocalDateTime.now(clock);

        /*
         * 공연 시작 시각과 같거나 이미 지난 경우
         * 사용자 취소 불가.
         */
        if (!now.isBefore(
                performance.getStartsAt()
        )) {
            throw new ReservationException(
                    ReservationErrorCode
                            .RESERVATION_CANCELLATION_AFTER_PERFORMANCE_STARTED
            );
        }

        Long cancelAmount =
                payment.getCancellableAmount();

        PaymentCancellation cancellation =
                payment.requestCancellation(
                        cancellationNumberGenerator.generate(),
                        cancelAmount,
                        reason,
                        now
                );

        PaymentCancellation savedCancellation =
                paymentCancellationRepository.save(
                        cancellation
                );

        return new PaymentCancellationPreparationResult(
                payment.getId(),
                savedCancellation.getId(),
                payment.getProvider(),
                payment.getProviderPaymentId(),
                cancelAmount,
                reason
        );
    }

    @Transactional
    public PaymentCancellationPreparationResult start(
            Long memberId,
            Long paymentId,
            Long amount,
            String reason
    ) {
        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new PaymentException(
                                        PaymentErrorCode.PAYMENT_NOT_FOUND
                                )
                        );

        reservationRepository
                .findByIdAndMemberId(
                        payment.getReservationId(),
                        memberId
                )
                .orElseThrow(() ->
                        new PaymentException(
                                PaymentErrorCode.PAYMENT_NOT_FOUND
                        )
                );

        LocalDateTime now =
                LocalDateTime.now(clock);

        PaymentCancellation cancellation =
                payment.requestCancellation(
                        cancellationNumberGenerator.generate(),
                        amount,
                        reason,
                        now
                );

        /*
         * Payment가 managed 상태라 cascade로 저장되지만,
         * CompletePaymentCancellationService
         */
        PaymentCancellation savedCancellation =
                paymentCancellationRepository.save(
                        cancellation
                );
        return new PaymentCancellationPreparationResult(
                payment.getId(),
                savedCancellation.getId(),
                payment.getProvider(),
                payment.getProviderPaymentId(),
                amount,
                reason
        );
    }
}
