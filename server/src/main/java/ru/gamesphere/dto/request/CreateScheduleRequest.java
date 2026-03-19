package ru.gamesphere.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CreateScheduleRequest {

    @NotNull
    private LocalTime openTime;

    @NotNull
    private LocalTime closeTime;

    private String note;
}
