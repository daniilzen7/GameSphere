package ru.gamesphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.gamesphere.dto.response.ApiResponse;
import ru.gamesphere.dto.response.GameResponse;
import ru.gamesphere.dto.response.PaginatedResponse;
import ru.gamesphere.enums.Complexity;
import ru.gamesphere.service.GameService;

import java.util.UUID;

@Tag(name = "Games", description = "Каталог настольных игр (публичный)")
@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @Operation(summary = "Каталог настольных игр", operationId = "listGames")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<GameResponse>>> getGames(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Complexity complexity,
            @RequestParam(required = false) Integer minPlayers,
            @RequestParam(required = false) Integer maxPlayers,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        Sort sort = sortOrder.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.min(perPage, 100), sort);

        var result = gameService.getGames(search, genre, complexity, minPlayers, maxPlayers, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PaginatedResponse.from(result)));
    }

    @Operation(summary = "Детальная карточка игры", operationId = "getGame")
    @GetMapping("/{gameId}")
    public ResponseEntity<ApiResponse<GameResponse>> getGame(@PathVariable UUID gameId) {
        return ResponseEntity.ok(ApiResponse.ok(gameService.getGame(gameId)));
    }
}
