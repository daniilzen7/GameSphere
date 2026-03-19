package ru.gamesphere.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.gamesphere.enums.NotificationStatus;
import ru.gamesphere.enums.NotificationTemplate;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private NotificationTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.QUEUED;

    @Column(length = 255)
    private String providerMessageId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant sentAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
