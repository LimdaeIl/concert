package com.concert.backend.performance.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminPerformanceQueryMapper {

    List<AdminPerformanceQueryRow> findAll(
            @Param("condition")
            AdminPerformanceSearchCondition condition
    );

    long count(
            @Param("condition")
            AdminPerformanceSearchCondition condition
    );
}
