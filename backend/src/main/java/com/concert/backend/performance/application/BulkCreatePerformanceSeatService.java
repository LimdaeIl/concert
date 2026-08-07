package com.concert.backend.performance.application;

import com.concert.backend.performance.application.command.CreatePerformanceSeatCommand;
import com.concert.backend.performance.application.result.PerformanceSeatResult;
import com.concert.backend.performance.domain.Performance;
import com.concert.backend.performance.domain.PerformanceRepository;
import com.concert.backend.performance.domain.PerformanceSeat;
import com.concert.backend.performance.domain.PerformanceSeatRepository;
import com.concert.backend.performance.domain.PerformanceStatus;
import com.concert.backend.performance.exception.PerformanceErrorCode;
import com.concert.backend.performance.exception.PerformanceException;
import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class BulkCreatePerformanceSeatService {

    private final PerformanceRepository performanceRepository;
    private final PerformanceSeatRepository performanceSeatRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public List<PerformanceSeatResult> create(
            Long performanceId,
            List<CreatePerformanceSeatCommand> commands
    ) {
        Performance performance =
                performanceRepository.findById(performanceId)
                        .orElseThrow(() ->
                                new PerformanceException(
                                        PerformanceErrorCode.PERFORMANCE_NOT_FOUND
                                )
                        );

        /*
         * OPEN 이후에는 이미 판매가 시작됐을 수 있으므로
         * 좌석 구조 추가를 허용하지 않는다.
         */
        if (performance.getStatus()
                != PerformanceStatus.SCHEDULED) {
            throw new PerformanceException(
                    PerformanceErrorCode
                            .PERFORMANCE_NOT_AVAILABLE_FOR_SEAT_CONFIGURATION
            );
        }

        validateRequestDuplicates(commands);

        List<Long> seatIds = commands.stream()
                .map(CreatePerformanceSeatCommand::seatId)
                .toList();

        List<Seat> seats =
                seatRepository.findAllById(seatIds);

        if (seats.size() != seatIds.size()) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_FOUND
            );
        }

        Map<Long, Seat> seatsById = seats.stream()
                .collect(Collectors.toMap(
                        Seat::getId,
                        Function.identity()
                ));

        List<PerformanceSeat> performanceSeats =
                commands.stream()
                        .map(command ->
                                createPerformanceSeat(
                                        performance,
                                        seatsById.get(
                                                command.seatId()
                                        ),
                                        command
                                )
                        )
                        .toList();

        return performanceSeatRepository
                .saveAll(performanceSeats)
                .stream()
                .map(PerformanceSeatResult::from)
                .toList();
    }

    private PerformanceSeat createPerformanceSeat(
            Performance performance,
            Seat seat,
            CreatePerformanceSeatCommand command
    ) {
        if (!seat.getVenueHall()
                .getId()
                .equals(performance.getVenueHallId())) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_AVAILABLE_FOR_PERFORMANCE
            );
        }

        if (!seat.isActive()) {
            throw new PerformanceException(
                    PerformanceErrorCode.SEAT_NOT_AVAILABLE_FOR_PERFORMANCE
            );
        }

        if (performanceSeatRepository
                .existsByPerformanceIdAndSeatId(
                        performance.getId(),
                        seat.getId()
                )) {
            throw new PerformanceException(
                    PerformanceErrorCode.DUPLICATE_PERFORMANCE_SEAT
            );
        }

        return PerformanceSeat.create(
                performance,
                seat,
                command.grade(),
                command.price()
        );
    }

    private void validateRequestDuplicates(
            List<CreatePerformanceSeatCommand> commands
    ) {
        Set<Long> ids = new HashSet<>();

        for (CreatePerformanceSeatCommand command
                : commands) {

            if (!ids.add(command.seatId())) {
                throw new PerformanceException(
                        PerformanceErrorCode.DUPLICATE_PERFORMANCE_SEAT
                );
            }
        }
    }
}
