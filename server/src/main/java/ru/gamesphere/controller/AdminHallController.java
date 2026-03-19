package ru.gamesphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.gamesphere.dto.request.*;
import ru.gamesphere.dto.response.*;
import ru.gamesphere.service.HallService;
import ru.gamesphere.service.TableService;

import java.util.List;
import java.util.UUID;

@Tag(name = "Admin — Halls & Tables", description = "Управление залами и столиками (менеджер)")
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminHallController {

    private final HallService hallService;
    private final TableService tableService;

    // --- Halls ---

    @Operation(summary = "Список залов", operationId = "listHalls")
    @GetMapping("/halls")
    public ResponseEntity<ApiResponse<List<HallResponse>>> getAllHalls() {
        return ResponseEntity.ok(ApiResponse.ok(hallService.getAllHalls()));
    }

    @Operation(summary = "Создать зал", operationId = "createHall")
    @PostMapping("/halls")
    public ResponseEntity<ApiResponse<HallResponse>> createHall(@Valid @RequestBody CreateHallRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(hallService.createHall(request)));
    }

    @Operation(summary = "Обновить зал", operationId = "updateHall")
    @PutMapping("/halls/{hallId}")
    public ResponseEntity<ApiResponse<HallResponse>> updateHall(
            @PathVariable UUID hallId,
            @Valid @RequestBody UpdateHallRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(hallService.updateHall(hallId, request)));
    }

    @Operation(summary = "Деактивировать зал", operationId = "deleteHall")
    @DeleteMapping("/halls/{hallId}")
    public ResponseEntity<ApiResponse<Void>> deleteHall(@PathVariable UUID hallId) {
        hallService.deleteHall(hallId);
        return ResponseEntity.ok(ApiResponse.ok("Зал деактивирован", null));
    }

    // --- Tables ---

    @Operation(summary = "Столики в зале", operationId = "listTablesInHall")
    @GetMapping("/halls/{hallId}/tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTablesByHall(@PathVariable UUID hallId) {
        return ResponseEntity.ok(ApiResponse.ok(tableService.getTablesByHall(hallId)));
    }

    @Operation(summary = "Добавить столик", operationId = "createTable")
    @PostMapping("/halls/{hallId}/tables")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(
            @PathVariable UUID hallId,
            @Valid @RequestBody CreateTableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(tableService.createTable(hallId, request)));
    }

    @Operation(summary = "Обновить столик", operationId = "updateTable")
    @PutMapping("/tables/{tableId}")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable UUID tableId,
            @Valid @RequestBody CreateTableRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(tableService.updateTable(tableId, request)));
    }

    @Operation(summary = "Деактивировать столик", operationId = "deleteTable")
    @DeleteMapping("/tables/{tableId}")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable UUID tableId) {
        tableService.deleteTable(tableId);
        return ResponseEntity.ok(ApiResponse.ok("Столик деактивирован", null));
    }
}