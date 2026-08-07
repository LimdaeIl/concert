package com.concert.backend.booking.infrastructure.mybatis;

import com.concert.backend.booking.application.condition.MyReservationSearchCondition;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingDetailQueryDto;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingQueryDto;
import com.concert.backend.booking.infrastructure.mybatis.dto.MyBookingSeatQueryDto;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MyBookingMapper {

    List<MyBookingQueryDto> search(
            MyReservationSearchCondition condition
    );

    long count(
            MyReservationSearchCondition condition
    );

    Optional<MyBookingDetailQueryDto> findDetail(
            @Param("memberId") Long memberId,
            @Param("reservationId") Long reservationId
    );

    List<MyBookingSeatQueryDto> findSeats(
            @Param("memberId") Long memberId,
            @Param("reservationId") Long reservationId
    );
}
