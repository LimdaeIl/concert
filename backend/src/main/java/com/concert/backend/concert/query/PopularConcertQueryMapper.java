package com.concert.backend.concert.query;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PopularConcertQueryMapper {

    List<PopularConcertQueryRow> findPopularConcerts(
            @Param("limit")
            int limit
    );
}
