package com.concert.backend.performance.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminPerformanceSeatCandidateQueryMapper {

    List<AdminPerformanceSeatCandidateRow> findAll(
            @Param("condition")
            AdminPerformanceSeatCandidateCondition condition
    );

    long count(
            @Param("condition")
            AdminPerformanceSeatCandidateCondition condition
    );
}
