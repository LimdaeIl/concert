package com.concert.backend.reservation.application;

import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.reservation.domain.Reservation;
import com.concert.backend.reservation.domain.ReservationRepository;
import com.concert.backend.reservation.domain.ReservationSeat;
import com.concert.backend.reservation.exception.ReservationErrorCode;
import com.concert.backend.reservation.exception.ReservationException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CancelReservationService {

    private final ReservationRepository reservationRepository;
    private final PerformanceRepository performanceRepository;
    private final PerformanceSeatRepository performanceSeatRepository;

    /**
     * 결제 전 예약 취소. * * PENDING_PAYMENT 상태의 예약만 취소합니다. * 회원이 임시 선점한 HELD 좌석을 AVAILABLE로 복구합니다.
     */
    @Transactional
    public void cancelPendingReservation(Long memberId, Long reservationId,
            LocalDateTime cancelledAt) {
        Reservation reservation = findOwnedReservation(reservationId, memberId);
        if (!reservation.isPendingPayment()) {
            throw new ReservationException(ReservationErrorCode.INVALID_RESERVATION_STATUS);
        }
        releaseHeldSeats(reservation);
        reservation.cancel(cancelledAt);
    }

    /**
     * 사용자 결제 취소가 PG에서 성공한 이후 예약을 취소합니다. * * COMPLETED 예약의 RESERVED 좌석을 AVAILABLE로 복구합니다.
     */
    @Transactional
    public void cancelAfterPaymentCancellation(Long reservationId, LocalDateTime cancelledAt) {
        Reservation reservation = findReservation(reservationId);
        releaseReservedSeats(reservation);
        reservation.cancel(cancelledAt);
    }

    /**
     * 관리자 환불이 PG에서 성공한 이후 예약을 취소합니다. * * 공연 시작 전: * RESERVED -> AVAILABLE * * 공연 시작 후: * RESERVED
     * 상태 유지
     */
    @Transactional
    public void cancelByAdminRefund(Long reservationId, LocalDateTime cancelledAt) {
        Reservation reservation = findReservation(reservationId);
        Performance performance = performanceRepository.findById(reservation.getPerformanceId())
                .orElseThrow(
                        () -> new PerformanceException(PerformanceErrorCode.PERFORMANCE_NOT_FOUND));
        if (cancelledAt.isBefore(performance.getStartsAt())) {
            releaseReservedSeats(reservation);
        }
        reservation.cancel(cancelledAt);
    }

    private Reservation findOwnedReservation(Long reservationId, Long memberId) {
        return reservationRepository.findByIdAndMemberId(reservationId, memberId).orElseThrow(
                () -> new ReservationException(ReservationErrorCode.RESERVATION_NOT_FOUND));
    }

    private Reservation findReservation(Long reservationId) {
        return reservationRepository.findById(reservationId).orElseThrow(
                () -> new ReservationException(ReservationErrorCode.RESERVATION_NOT_FOUND));
    }

    /**
     * PENDING_PAYMENT 취소. * * HELD -> AVAILABLE
     */
    private void releaseHeldSeats(Reservation reservation) {
        List<PerformanceSeat> seats = findReservationPerformanceSeats(reservation);
        for (PerformanceSeat seat : seats) {
            seat.release(reservation.getMemberId());
        }
    }

    /**
     * 결제 완료 예약 취소. * * RESERVED -> AVAILABLE
     */
    private void releaseReservedSeats(Reservation reservation) {
        List<PerformanceSeat> seats = findReservationPerformanceSeats(reservation);
        for (PerformanceSeat seat : seats) {
            seat.cancelReservation();
        }
    }

    private List<PerformanceSeat> findReservationPerformanceSeats(Reservation reservation) {
        List<Long> performanceSeatIds = reservation.getReservationSeats().stream()
                .map(ReservationSeat::getPerformanceSeatId).toList();
        List<PerformanceSeat> seats = performanceSeatRepository.findAllById(performanceSeatIds);
        if (seats.size() != performanceSeatIds.size()) {
            throw new ReservationException(ReservationErrorCode.RESERVATION_SEAT_REQUIRED);
        }
        return seats;
    }
}