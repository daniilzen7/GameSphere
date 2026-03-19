package ru.gamesphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.gamesphere.dto.request.CreateGameRequest;
import ru.gamesphere.dto.request.UpdateGameRequest;
import ru.gamesphere.dto.response.ApiResponse;
import ru.gamesphere.dto.response.GameResponse;
import ru.gamesphere.service.GameService;

import java.util.UUID;

@Tag(name = "Admin — Games", description = "Управление каталогом игр (менеджер)")
@RestController
@RequestMapping("/admin/games")
@RequiredArgsConstructor
public class AdminGameController {

    private final GameService gameService;

    @Operation(summary = "Добавить игру в каталог", operationId = "createGame")
    @PostMapping
    public ResponseEntity<ApiResponse<GameResponse>> createGame(@Valid @RequestBody CreateGameRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(gameService.createGame(request)));
    }

    @Operation(summary = "Обновить игру", operationId = "updateGame")
    @PutMapping("/{gameId}")
    public ResponseEntity<ApiResponse<GameResponse>> updateGame(
            @PathVariable UUID gameId,
            @Valid @RequestBody UpdateGameRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(gameService.updateGame(gameId, request)));
    }

    @Operation(summary = "Архивировать игру", operationId = "deleteGame")
    @DeleteMapping("/{gameId}")
    public ResponseEntity<ApiResponse<Void>> deleteGame(@PathVariable UUID gameId) {
        gameService.deleteGame(gameId);
        return ResponseEntity.ok(ApiResponse.ok("Игра перемещена в архив", null));
    }
}
