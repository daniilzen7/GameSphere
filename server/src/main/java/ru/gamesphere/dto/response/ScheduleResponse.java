package ru.gamesphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private UUID scheduleId;
    private LocalDate date;
    private LocalTime openTime;
    private LocalTime closeTime;
    private String note;
}
