package com.concert.backend.performance.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminPerformanceSeatQueryMapper {

    List<AdminPerformanceSeatQueryRow> findAll(
            @Param("condition")
            AdminPerformanceSeatSearchCondition condition
    );

    long count(
            @Param("condition")
            AdminPerformanceSeatSearchCondition condition
    );
}
