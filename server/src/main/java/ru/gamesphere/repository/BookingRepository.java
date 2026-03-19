package ru.gamesphere.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.gamesphere.entity.Booking;
import ru.gamesphere.enums.BookingStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findAllByUserId(UUID userId, Pageable pageable);

    Page<Booking> findAllByUserIdAndStatus(UUID userId, BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.table.id = :tableId " +
            "AND b.status = 'ACTIVE' " +
            "AND b.startAt < :endAt AND b.endAt > :startAt")
    List<Booking> findConflicting(
            @Param("tableId") UUID tableId,
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt);

    @Query("SELECT b FROM Booking b WHERE b.table.id = :tableId " +
            "AND b.status = 'ACTIVE' " +
            "AND b.startAt < :endAt AND b.endAt > :startAt " +
            "AND b.id <> :excludeId")
    List<Booking> findConflictingExcluding(
            @Param("tableId") UUID tableId,
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt,
            @Param("excludeId") UUID excludeId);

    boolean existsByUserIdAndStatusAndEndAtAfter(UUID userId, BookingStatus status, Instant now);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.game.id = :gameId " +
            "AND b.status = 'ACTIVE' " +
            "AND b.startAt < :endAt AND b.endAt > :startAt")
    long countActiveGameBookings(
            @Param("gameId") UUID gameId,
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt);

    @Query("SELECT b FROM Booking b JOIN FETCH b.table t JOIN FETCH t.hall " +
            "JOIN FETCH b.user " +
            "LEFT JOIN FETCH b.game " +
            "WHERE b.startAt >= :dateFrom AND b.startAt < :dateTo " +
            "AND (:hallId IS NULL OR t.hall.id = :hallId) " +
            "AND (:status IS NULL OR b.status = :status)")
    List<Booking> findAdminBookings(
            @Param("dateFrom") Instant dateFrom,
            @Param("dateTo") Instant dateTo,
            @Param("hallId") UUID hallId,
            @Param("status") BookingStatus status);
}
