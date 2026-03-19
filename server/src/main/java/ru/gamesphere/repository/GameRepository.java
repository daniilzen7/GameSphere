package ru.gamesphere.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.gamesphere.entity.Game;
import ru.gamesphere.enums.Complexity;

import java.util.Optional;
import java.util.UUID;

public interface GameRepository extends JpaRepository<Game, UUID> {

    @Query(value = "SELECT * FROM games g WHERE g.is_active = true " +
            "AND (CAST(:search AS text) IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) " +
            "AND (CAST(:genre AS text) IS NULL OR g.genre = CAST(:genre AS text)) " +
            "AND (CAST(:complexity AS text) IS NULL OR g.complexity = CAST(:complexity AS text)) " +
            "AND (CAST(:minPlayers AS int) IS NULL OR g.max_players >= CAST(:minPlayers AS int)) " +
            "AND (CAST(:maxPlayers AS int) IS NULL OR g.min_players <= CAST(:maxPlayers AS int))",
            countQuery = "SELECT COUNT(*) FROM games g WHERE g.is_active = true " +
            "AND (CAST(:search AS text) IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) " +
            "AND (CAST(:genre AS text) IS NULL OR g.genre = CAST(:genre AS text)) " +
            "AND (CAST(:complexity AS text) IS NULL OR g.complexity = CAST(:complexity AS text)) " +
            "AND (CAST(:minPlayers AS int) IS NULL OR g.max_players >= CAST(:minPlayers AS int)) " +
            "AND (CAST(:maxPlayers AS int) IS NULL OR g.min_players <= CAST(:maxPlayers AS int))",
            nativeQuery = true)
    Page<Game> findWithFilters(
            @Param("search") String search,
            @Param("genre") String genre,
            @Param("complexity") String complexity,
            @Param("minPlayers") Integer minPlayers,
            @Param("maxPlayers") Integer maxPlayers,
            Pageable pageable);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM games WHERE LOWER(title) = LOWER(CAST(:title AS text)))", nativeQuery = true)
    boolean existsByTitleIgnoreCase(@Param("title") String title);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM games WHERE LOWER(title) = LOWER(CAST(:title AS text)) AND id != :id)", nativeQuery = true)
    boolean existsByTitleIgnoreCaseAndIdNot(@Param("title") String title, @Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT g FROM Game g WHERE g.id = :id")
    Optional<Game> findByIdForUpdate(@Param("id") UUID id);
}
