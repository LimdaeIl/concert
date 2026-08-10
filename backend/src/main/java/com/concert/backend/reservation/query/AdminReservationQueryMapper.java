package com.concert.backend.reservation.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminReservationQueryMapper {

    List<AdminReservationQueryRow> findAll(
            @Param("condition")
            AdminReservationSearchCondition condition
    );

    long count(
            @Param("condition")
            AdminReservationSearchCondition condition
    );
}
