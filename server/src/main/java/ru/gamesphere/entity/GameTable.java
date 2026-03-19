package ru.gamesphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "game_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameTable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @Column(nullable = false, length = 32)
    private String label;

    private Integer seats;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
