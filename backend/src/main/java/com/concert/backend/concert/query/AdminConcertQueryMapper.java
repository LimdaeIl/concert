package com.concert.backend.concert.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminConcertQueryMapper {

    List<AdminConcertQueryRow> findAll(
            @Param("condition")
            AdminConcertSearchCondition condition
    );

    long count(
            @Param("condition")
            AdminConcertSearchCondition condition
    );
}
