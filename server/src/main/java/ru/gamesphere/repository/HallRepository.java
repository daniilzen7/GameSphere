package ru.gamesphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.gamesphere.entity.Hall;

import java.util.List;
import java.util.UUID;

public interface HallRepository extends JpaRepository<Hall, UUID> {

    List<Hall> findAllByIsActiveTrue();
}
