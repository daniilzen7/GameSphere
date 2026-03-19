package ru.gamesphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.gamesphere.dto.request.CreateBookingRequest;
import ru.gamesphere.dto.response.ApiResponse;
import ru.gamesphere.dto.response.AvailableSlotResponse;
import ru.gamesphere.dto.response.BookingResponse;
import ru.gamesphere.dto.response.PaginatedResponse;
import ru.gamesphere.enums.BookingStatus;
import ru.gamesphere.service.BookingService;

import java.time.LocalDate;
import java.util.UUID;

@Tag(name = "Bookings", description = "Бронирования (игрок)")
@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @Operation(summary = "Доступные слоты для бронирования", operationId = "getAvailableSlots")
    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse<AvailableSlotResponse>> getAvailableSlots(
            @RequestParam LocalDate date,
            @RequestParam int guests,
            @RequestParam(defaultValue = "120") int durationMinutes) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getAvailableSlots(date, guests, durationMinutes)));
    }

    @Operation(summary = "Создать бронирование", operationId = "createBooking")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Столик успешно забронирован!", response));
    }

    @Operation(summary = "Мои бронирования", operationId = "getMyBookings")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PaginatedResponse<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage) {

        BookingStatus bookingStatus = "all".equalsIgnoreCase(status) ? null : BookingStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), perPage, Sort.by("createdAt").descending());

        var result = bookingService.getUserBookings(userDetails.getUsername(), bookingStatus, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PaginatedResponse.from(result)));
    }

    @Operation(summary = "Отменить бронирование", operationId = "cancelBooking")
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.cancelBooking(bookingId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Бронирование успешно отменено", response));
    }
}
