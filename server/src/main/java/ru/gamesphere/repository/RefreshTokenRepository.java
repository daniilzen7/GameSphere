package ru.gamesphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.gamesphere.entity.RefreshToken;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    void deleteAllByUserId(UUID userId);
}
