package ru.gamesphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.gamesphere.entity.GameTable;

import java.util.List;
import java.util.UUID;

public interface GameTableRepository extends JpaRepository<GameTable, UUID> {

    List<GameTable> findAllByHallId(UUID hallId);

    @Query("SELECT t FROM GameTable t JOIN FETCH t.hall WHERE t.isActive = true AND t.hall.isActive = true AND t.seats >= :minSeats")
    List<GameTable> findAvailableTables(@Param("minSeats") int minSeats);
}
