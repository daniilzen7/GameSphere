package ru.gamesphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.gamesphere.dto.request.AdminCreateBookingRequest;
import ru.gamesphere.dto.request.AdminUpdateBookingRequest;
import ru.gamesphere.dto.response.AdminBookingResponse;
import ru.gamesphere.dto.response.ApiResponse;
import ru.gamesphere.dto.response.BookingResponse;
import ru.gamesphere.enums.BookingStatus;
import ru.gamesphere.service.BookingService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Tag(name = "Admin — Bookings", description = "Управление сеткой бронирований (менеджер)")
@RestController
@RequestMapping("/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    @Operation(summary = "Сетка бронирований", operationId = "getAdminBookings")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminBookingResponse>>> getAdminBookings(
            @RequestParam LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(required = false) UUID hallId,
            @RequestParam(defaultValue = "active") String status) {
        BookingStatus bookingStatus = "all".equalsIgnoreCase(status) ? null : BookingStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getAdminBookings(dateFrom, dateTo, hallId, bookingStatus)));
    }

    @Operation(summary = "Создать бронь вручную", operationId = "createAdminBooking")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createAdminBooking(
            @Valid @RequestBody AdminCreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(bookingService.createAdminBooking(request)));
    }

    @Operation(summary = "Изменить бронирование", operationId = "updateAdminBooking")
    @PatchMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @PathVariable UUID bookingId,
            @Valid @RequestBody AdminUpdateBookingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.updateAdminBooking(bookingId, request)));
    }

    @Operation(summary = "Принудительное создание при конфликте", operationId = "forceCreateBooking")
    @PostMapping("/{bookingId}/force-create")
    public ResponseEntity<ApiResponse<BookingResponse>> forceCreate(
            @PathVariable UUID bookingId,
            @Valid @RequestBody AdminCreateBookingRequest request) {
        BookingResponse response = bookingService.forceCreateBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Бронирование создано принудительно (с пересечением)", response));
    }
}
