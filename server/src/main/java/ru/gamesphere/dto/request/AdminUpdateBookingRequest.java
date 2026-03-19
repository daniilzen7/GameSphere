package ru.gamesphere.dto.request;

import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Data
public class AdminUpdateBookingRequest {

    private UUID tableId;

    private LocalTime startTime;

    private Integer durationMinutes;

    private String status;
}
