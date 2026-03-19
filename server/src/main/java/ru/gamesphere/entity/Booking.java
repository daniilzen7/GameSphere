package ru.gamesphere.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.gamesphere.enums.BookingStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private GameTable table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;

    @Column(nullable = false)
    private Instant startAt;

    @Column(nullable = false)
    private Instant endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private BookingStatus status = BookingStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant cancelledAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
