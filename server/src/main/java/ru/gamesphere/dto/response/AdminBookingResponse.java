package ru.gamesphere.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.gamesphere.enums.BookingStatus;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminBookingResponse {

    private UUID bookingId;
    private UserInfo user;
    private TableInfo table;
    private GameInfo game;
    private Instant startAt;
    private Instant endAt;
    private BookingStatus status;
    private Instant createdAt;
    private Instant cancelledAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private UUID userId;
        private String fullName;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableInfo {
        private UUID tableId;
        private String label;
        private String hallName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameInfo {
        private UUID gameId;
        private String title;
    }
}
