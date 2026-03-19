package ru.gamesphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.gamesphere.enums.NotificationStatus;
import ru.gamesphere.enums.NotificationTemplate;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID notificationId;
    private UUID bookingId;
    private UUID userId;
    private NotificationTemplate template;
    private NotificationStatus status;
    private String providerMessageId;
    private Instant createdAt;
    private Instant sentAt;
}
