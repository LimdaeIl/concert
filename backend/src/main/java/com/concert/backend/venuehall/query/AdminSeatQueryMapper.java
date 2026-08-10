package com.concert.backend.venuehall.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminSeatQueryMapper {

    List<AdminSeatQueryRow> findAll(
            @Param("condition")
            AdminSeatSearchCondition condition
    );

    long count(
            @Param("condition")
            AdminSeatSearchCondition condition
    );
}
