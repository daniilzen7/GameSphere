package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.dto.request.CreateGameRequest;
import ru.gamesphere.dto.request.UpdateGameRequest;
import ru.gamesphere.dto.response.GameResponse;
import ru.gamesphere.entity.Game;
import ru.gamesphere.enums.Complexity;
import ru.gamesphere.exception.ConflictException;
import ru.gamesphere.exception.ResourceNotFoundException;
import ru.gamesphere.mapper.GameMapper;
import ru.gamesphere.repository.GameRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GameMapper gameMapper;

    public Page<GameResponse> getGames(String search, String genre, Complexity complexity,
                                       Integer minPlayers, Integer maxPlayers, Pageable pageable) {
        String complexityStr = complexity != null ? complexity.name() : null;
        return gameRepository.findWithFilters(search, genre, complexityStr, minPlayers, maxPlayers, pageable)
                .map(gameMapper::toGameResponse);
    }

    public GameResponse getGame(UUID id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game", id));
        return gameMapper.toGameResponse(game);
    }

    @Transactional
    public GameResponse createGame(CreateGameRequest request) {
        if (gameRepository.existsByTitleIgnoreCase(request.getTitle())) {
            throw new ConflictException("GAME_TITLE_EXISTS", "Игра с таким названием уже существует.");
        }

        Game game = Game.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .minPlayers(request.getMinPlayers())
                .maxPlayers(request.getMaxPlayers())
                .complexity(request.getComplexity())
                .genre(request.getGenre())
                .totalCopies(request.getTotalCopies() != null ? request.getTotalCopies() : 1)
                .build();
        return gameMapper.toGameResponse(gameRepository.save(game));
    }

    @Transactional
    public GameResponse updateGame(UUID id, UpdateGameRequest request) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game", id));

        if (request.getTitle() != null) {
            if (gameRepository.existsByTitleIgnoreCaseAndIdNot(request.getTitle(), id)) {
                throw new ConflictException("GAME_TITLE_EXISTS", "Игра с таким названием уже существует.");
            }
            game.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) game.setDescription(request.getDescription());
        if (request.getMinPlayers() != null) game.setMinPlayers(request.getMinPlayers());
        if (request.getMaxPlayers() != null) game.setMaxPlayers(request.getMaxPlayers());
        if (request.getComplexity() != null) game.setComplexity(request.getComplexity());
        if (request.getGenre() != null) game.setGenre(request.getGenre());
        if (request.getTotalCopies() != null) game.setTotalCopies(request.getTotalCopies());
        if (request.getIsActive() != null) game.setIsActive(request.getIsActive());

        return gameMapper.toGameResponse(gameRepository.save(game));
    }

    @Transactional
    public void deleteGame(UUID id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game", id));
        game.setIsActive(false);
        gameRepository.save(game);
    }
}
