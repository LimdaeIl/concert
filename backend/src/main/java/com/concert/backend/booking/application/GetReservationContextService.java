package com.concert.backend.booking.application;

import com.concert.backend.booking.application.result.ReservationContextResult;
import com.concert.backend.booking.application.result.ReservationContextResult.PendingReservationResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetReservationContextService {

    private static final Set<PerformanceStatus> PUBLIC_STATUSES = Set.of(
            PerformanceStatus.SCHEDULED, PerformanceStatus.OPEN, PerformanceStatus.SOLD_OUT);
    private final PerformanceRepository performanceRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public ReservationContextResult get(Long memberId, Long performanceId) {
        Performance performance = performanceRepository.findByIdAndStatusIn(performanceId,
                PUBLIC_STATUSES).orElseThrow(
                () -> new PerformanceException(PerformanceErrorCode.PERFORMANCE_NOT_FOUND));
        int maxTicketsPerMember = performance.getMaxTicketsPerMember();
        long reservedTicketCount = reservationRepository.countActiveReservationSeats(memberId,
                performanceId);
        long remainingTicketCount = Math.max(maxTicketsPerMember - reservedTicketCount, 0);
        LocalDateTime now = LocalDateTime.now();
        PendingReservationResult pendingReservation = reservationRepository.findActivePendingReservation(
                memberId, performanceId, now).map(this::toPendingReservationResult).orElse(null);
        return new ReservationContextResult(maxTicketsPerMember, reservedTicketCount,
                remainingTicketCount, pendingReservation);
    }

    private PendingReservationResult toPendingReservationResult(Reservation reservation) {
        return new PendingReservationResult(reservation.getId(), reservation.getReservationNumber(),
                reservation.getReservationSeats().size(), reservation.getTotalAmount(),
                reservation.getExpiresAt());
    }
}
