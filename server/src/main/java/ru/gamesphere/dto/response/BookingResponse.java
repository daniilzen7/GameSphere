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
public class BookingResponse {

    private UUID bookingId;
    private UUID userId;
    private UUID tableId;
    private String tableLabel;
    private String hallName;
    private UUID gameId;
    private String gameTitle;
    private Instant startAt;
    private Instant endAt;
    private BookingStatus status;
    private Instant createdAt;
    private Instant cancelledAt;
}
