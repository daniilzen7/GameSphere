package ru.gamesphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.gamesphere.dto.request.CreateScheduleRequest;
import ru.gamesphere.dto.response.ApiResponse;
import ru.gamesphere.dto.response.ScheduleResponse;
import ru.gamesphere.service.ScheduleService;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Admin — Schedule", description = "Расписание работы клуба")
@RestController
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Operation(summary = "Расписание работы клуба", operationId = "getSchedule")
    @GetMapping("/schedule")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(ApiResponse.ok(scheduleService.getSchedule(dateFrom, dateTo)));
    }

    @Operation(summary = "Задать расписание на дату", operationId = "upsertSchedule")
    @PutMapping("/admin/schedule/{date}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> upsertSchedule(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody CreateScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(scheduleService.upsertSchedule(date, request)));
    }
}
