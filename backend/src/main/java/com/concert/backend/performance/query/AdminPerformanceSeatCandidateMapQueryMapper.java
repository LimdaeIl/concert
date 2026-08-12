package com.concert.backend.performance.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminPerformanceSeatCandidateMapQueryMapper {

    List<AdminPerformanceSeatCandidateMapQueryRow> findAll(
            @Param("performanceId")
            Long performanceId,

            @Param("venueHallId")
            Long venueHallId
    );
}
