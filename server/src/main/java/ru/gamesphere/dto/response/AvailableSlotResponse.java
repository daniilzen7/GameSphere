package ru.gamesphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotResponse {

    private LocalDate date;
    private ClubHours clubHours;
    private List<Slot> slots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClubHours {
        private LocalTime openTime;
        private LocalTime closeTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Slot {
        private String slotId;
        private UUID tableId;
        private String tableLabel;
        private String hallName;
        private Integer seats;
        private LocalTime startTime;
        private LocalTime endTime;
    }
}
