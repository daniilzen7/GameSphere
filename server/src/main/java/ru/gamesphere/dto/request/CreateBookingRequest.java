package ru.gamesphere.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class CreateBookingRequest {

    @NotNull
    private UUID tableId;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime startTime;

    @NotNull
    @Min(60)
    @Max(360)
    private Integer durationMinutes;

    private UUID gameId;
}
