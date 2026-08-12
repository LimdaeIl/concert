package com.concert.backend.venuehall.infrastructure.jpa;

import com.concert.backend.venuehall.domain.Seat;
import com.concert.backend.venuehall.domain.SeatStatus;
import com.concert.backend.venuehall.domain.SeatType;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JpaSeatRepository
        extends JpaRepository<Seat, Long> {

    Optional<Seat> findByIdAndStatus(
            Long id,
            SeatStatus status
    );

    List<Seat> findAllByVenueHall_IdAndStatus(
            Long venueHallId,
            SeatStatus status
    );

    long countByVenueHall_Id(Long venueHallId);

    boolean existsByVenueHall_IdAndSectionNameAndFloorAndRowNameAndSeatNumber(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber
    );

    boolean existsByVenueHall_IdAndSectionNameAndFloorAndRowNameAndSeatNumberAndIdNot(
            Long venueHallId,
            String sectionName,
            Short floor,
            String rowName,
            String seatNumber,
            Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select s
            from Seat s
            where s.id in :ids
            order by s.id asc
            """)
    List<Seat> findAllByIdForUpdate(
            @Param("ids")
            Collection<Long> ids
    );

    @Query("""
        select s
        from Seat s
        where s.venueHall.id = :venueHallId
          and (
                :keyword is null
                or lower(s.sectionName) like lower(
                    concat('%', :keyword, '%')
                )
                or lower(s.rowName) like lower(
                    concat('%', :keyword, '%')
                )
                or lower(s.seatNumber) like lower(
                    concat('%', :keyword, '%')
                )
          )
          and (
                :floor is null
                or s.floor = :floor
          )
          and (
                :seatType is null
                or s.seatType = :seatType
          )
          and (
                :status is null
                or s.status = :status
          )
        order by
            s.floor asc,
            s.sectionName asc,
            s.rowName asc,
            s.id asc
        """)
    List<Seat> findAllForAdminSeatMap(
            @Param("venueHallId")
            Long venueHallId,

            @Param("keyword")
            String keyword,

            @Param("floor")
            Short floor,

            @Param("seatType")
            SeatType seatType,

            @Param("status")
            SeatStatus status
    );
}
