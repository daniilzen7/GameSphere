package ru.gamesphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.gamesphere.entity.ClubSchedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClubScheduleRepository extends JpaRepository<ClubSchedule, UUID> {

    Optional<ClubSchedule> findByDate(LocalDate date);

    List<ClubSchedule> findAllByDateBetween(LocalDate start, LocalDate end);
}
