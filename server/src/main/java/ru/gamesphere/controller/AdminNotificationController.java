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
import ru.gamesphere.dto.response.NotificationResponse;
import ru.gamesphere.dto.response.PaginatedResponse;
import ru.gamesphere.enums.NotificationStatus;
import ru.gamesphere.enums.NotificationTemplate;
import ru.gamesphere.service.NotificationService;

import java.util.UUID;

@Tag(name = "Admin — Notifications", description = "Мониторинг email-уведомлений (менеджер)")
@RestController
@RequestMapping("/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Статус email-уведомлений", operationId = "listNotifications")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<NotificationResponse>>> getNotifications(
            @RequestParam(required = false) NotificationStatus status,
            @RequestParam(required = false) NotificationTemplate template,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int perPage) {

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), perPage, Sort.by("createdAt").descending());
        var result = notificationService.getNotifications(status, template, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PaginatedResponse.from(result)));
    }

    @Operation(summary = "Повторная отправка", operationId = "retryNotification")
    @PostMapping("/{notificationId}/retry")
    public ResponseEntity<ApiResponse<NotificationResponse>> retryNotification(@PathVariable UUID notificationId) {
        NotificationResponse response = notificationService.retryNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.ok("Уведомление поставлено на повторную отправку", response));
    }
}
