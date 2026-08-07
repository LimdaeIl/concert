package com.concert.backend.booking.application;

import com.concert.backend.booking.application.condition.MyReservationSearchCondition;
import com.concert.backend.booking.application.result.MyBookingsResult;
import com.concert.backend.booking.exception.BookingErrorCode;
import com.concert.backend.booking.exception.BookingException;
import com.concert.backend.booking.infrastructure.mybatis.MyBookingMapper;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingQueryDto;
import com.concert.backend.booking.presentation.request.GetMyReservationsRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class GetMyBookingsService {

    private static final int MAX_PAGE_SIZE = 100;

    private final MyBookingMapper myBookingMapper;

    @Transactional(readOnly = true)
    public MyBookingsResult getBookings(
            Long memberId,
            GetMyReservationsRequest request
    ) {
        int page = request.resolvedPage();
        int size = request.resolvedSize();

        validatePage(page, size);
        validatePeriod(request);

        long offset =
                (long) page * size;

        MyReservationSearchCondition condition =
                new MyReservationSearchCondition(
                        memberId,
                        request.status(),
                        request.concertProgress(),
                        request.normalizedKeyword(),
                        request.from(),
                        request.to(),
                        request.resolvedSort(),
                        offset,
                        size
                );

        List<MyBookingQueryDto> bookings =
                myBookingMapper.search(
                        condition
                );

        long totalElements =
                myBookingMapper.count(
                        condition
                );

        return MyBookingsResult.of(
                bookings,
                page,
                size,
                totalElements
        );
    }

    private void validatePage(
            int page,
            int size
    ) {
        if (page < 0) {
            throw new BookingException(
                    BookingErrorCode.INVALID_PAGE
            );
        }

        if (size <= 0
                || size > MAX_PAGE_SIZE) {
            throw new BookingException(
                    BookingErrorCode.INVALID_PAGE_SIZE
            );
        }
    }

    private void validatePeriod(
            GetMyReservationsRequest request
    ) {
        if (request.from() == null
                || request.to() == null) {
            return;
        }

        if (request.from().isAfter(
                request.to()
        )) {
            throw new BookingException(
                    BookingErrorCode.INVALID_SEARCH_PERIOD
            );
        }
    }
}
