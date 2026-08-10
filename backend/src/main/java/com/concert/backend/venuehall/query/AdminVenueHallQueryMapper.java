package com.concert.backend.venuehall.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminVenueHallQueryMapper {

    List<AdminVenueHallQueryRow> findAll(
            @Param("condition")
            AdminVenueHallSearchCondition condition
    );

    long count(
            @Param("condition")
            AdminVenueHallSearchCondition condition
    );
}
